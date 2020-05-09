const request = require('request-promise')
const isIp = require('is-ip')
const Revision = require('../models/revision_model')
const Bot = require('../models/bot_model')
const Admin = require('../models/admin_model')


/**
 * Find all available articles with their title and the number of revisions.
 *
 * @return {Promise} - Resolve search results if succeed, reject error if fail.
 */
const findArticlesWithTitleAndRevisionCount = async () => {
    try {
        return await Revision.aggregate([
            {
                $group: {
                    _id: '$title',
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ])
    } catch (err) {
        return new Error(err)
    }
}

/**
 * Find the latest revision timestamp of an article.
 *
 * @param {string} article - The article title.
 * @return {Promise} - Resolve the latest timestamp if succeed, reject error if fail.
 */
const findLatestTimestamp = async (article) => {
    try {
        const latestRevision = await Revision.findOne({title: article}).sort({timestamp: -1}).select('timestamp')
        return latestRevision.timestamp
    } catch (err) {
        return new Error(err)
    }
}

/**
 * Update an article revisions in the database to the latest one.
 *
 * @param {string} article - Article name.
 * @param {string} startTime - The start time to update. The time is in ISO timestamp format.
 *
 * @return {Promise} Resolve the number of revisions updated s succeed, reject error if fail.
 */
const updateRevisions = async (article, startTime) => {
    // build API query url.
    const wikiEndpoint = "https://en.wikipedia.org/w/api.php";
    const parameters = [
        "titles=" + article,
        "rvstart=" + startTime,
        "rvdir=newer",
        "action=query",
        "prop=revisions",
        "rvlimit=500",
        "rvprop=user|timestamp",
        "formatversion=2",
        "format=json"
    ]
    const url = wikiEndpoint + "?" + parameters.join("&");
    const options = {
        url: url,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8'
        }
    };

    try {
        // search for new revisions
        const data = await request(options)
        const json = JSON.parse(data);
        const revisions = json.query.pages[0].revisions;

        // if find new revisions, save them into database and return the number of new revisions.
        if (revisions.length > 1) {
            await Promise.all(revisions.map(revision => {
                let newRevision = new Revision({
                    title: article,
                    user: revision.user,
                    timestamp: revision.timestamp,
                    anon: isIp(revision.user)
                })
                console.log(revision.timestamp, startTime)
                newRevision.save()
            }))
            return revisions.length
        }
        return 0
    } catch (err) {
        throw new Error(err)
    }
}

/**
 * For the selected article, get the number of revisions.
 *
 * @param {string} article - Article name.
 *
 * @return Resolve article's revision count if succeed, reject error if fail.
 */
const getRevisionCountByArticle = async (article) => {
    try {
        return await Revision.find({title: article}).countDocuments()
    } catch (err) {
        throw new Error(err)
    }
}

/**
 * For the selected article, get the top 5 regular users ranked by total revision numbers on this article, and the respective revision numbers
 *
 * @param {string} article - Article name.
 *
 * @return {Promise} Resolve top 5 regular users if succeed, reject error if fail.
 */
const getTopRegularUsersByArticle = async (article) => {
    try {
        const bots = await Bot.distinct('name'),
            admins = await Admin.distinct('name')
        const botsAndAdmins = bots.concat(admins)
        const topUsers = await Revision.aggregate([
            {
                $match: {
                    title: article,
                    user: {
                        $nin: botsAndAdmins
                    },
                    anon: false
                }
            },
            {
                $group: {
                    _id: '$user',
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    count: -1
                }
            }
        ])
        return topUsers.slice(1, 6)
    } catch (err) {
        throw new Error(err)
    }
}

/**
 * For the selected article, get top 3 news about the selected individual article obtained using Reddit API.
 *
 * @param {string} article - Article name.
 *
 * @return {Promise} Resolve top 3 news about the selected individual article obtained  if succeed, reject error if fail.
 */
const getTopNewsByArticle = async (article) => {
    const url = `https://www.reddit.com/r/news/search/.json?q=${article}&restrict_sr=1&limit=3&sort=top`
    try {
        const data = await request(url)
        const json = JSON.parse(data);
        const results = json.data.children
        let topNews = []
        results.forEach(result => {
            topNews.push({
                title: result.data.title,
                url: result.data.url
            })
        })
        return topNews
    } catch (err) {
        throw new Error(err)
    }
}

/**
 * For selected article, get the revision number distributed by year and by user type.
 *
 * @param {string} article - The article title.
 */
const getRevDistributionByYearAndUserType = async (article) => {
    const bots = await Bot.distinct('name')
    const admins = await Admin.distinct('name')
    const nonBotsOrAdmin = admins.concat(bots)

    const [botRevDistribution, adminRevDistribution, anonRevDistribution, regularRevDistribution] = await Promise.all([
        getRevDistributionByUserList(article, bots),
        getRevDistributionByUserList(article, admins),
        getAnonRevDistribution(article),
        getRegularRevDistribution(article, nonBotsOrAdmin)
    ])

    return {
        bot: botRevDistribution,
        admin: adminRevDistribution,
        anon: anonRevDistribution,
        regular: regularRevDistribution
    }
}

/**
 * For selected article, get the revision number distributed by year and by a username list.
 */
const getRevDistributionByUserList = async (article, userList) => {
    try {
        return await Revision.aggregate([
            {
                $match: {
                    title: article,
                    user: {
                        $in: userList
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $year: '$timestamp'
                    },
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ])
    } catch (err) {
        throw new Error(err)
    }
}

/**
 * For selected article, get the revision number distributed by anonymous users by year.
 */
const getAnonRevDistribution = async (article) => {
    try {
        return await Revision.aggregate([
            {
                $match: {
                    title: article,
                    anon: true
                }
            },
            {
                $group: {
                    _id: {
                        $year: '$timestamp'
                    },
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ])
    } catch (err) {
        throw new Error(err)
    }
}

/**
 *  For selected article, get the revision number distributed by regular users by year.
 */
const getRegularRevDistribution = async (article, nameList) => {
    try {
        return await Revision.aggregate([
            {
                $match: {
                    title: article,
                    anon: false,
                    user: {
                        $nin: nameList
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $year: '$timestamp'
                    },
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            }
        ])
    } catch (err) {
        throw new Error(err)
    }
}

module.exports = {
    findArticlesWithTitleAndRevisionCount,
    findLatestTimestamp,
    updateRevisions,
    getRevisionCountByArticle,
    getTopRegularUsersByArticle,
    getTopNewsByArticle,
    getRevDistributionByYearAndUserType
}
