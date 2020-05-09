const request = require('request-promise')
const isIp = require('is-ip')
const Revision = require('../models/revision_model')
const Bot = require('../models/bot_model')
const Admin = require('../models/admin_model')

/**
 * Find the name list of all distinct article editors/users.
 *
 * @return {Promise} - Resolve the list of  editor/user names if succeed, reject error if fail.
 */
const findAllAuthorNames = async () => {
    try {
        return await Revision.find({anon: false}).distinct('user')
    } catch (err) {
        return new Error(err)
    }
}

/**
 * Find top {@param filter} articles with the highest & smallest number of revisions.
 *
 * @param {number} filter - The number of top articles need to be found, the number must be a positive integer.
 * @return {Promise} - Resolve search results if succeed, reject error if fail.
 */
const findTopArticlesByRevisionCount = async (filter) => {
    try {
        const results = await Revision.aggregate([
            {
                '$group': {
                    _id: '$title',
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                '$sort': {
                    count: -1
                }
            }
        ])
        return {
            max: results.slice(0, filter),
            min: results.reverse().slice(0, filter)
        }
    } catch (err) {
        throw new Error(err)
    }
}

/**
 * Find top {@param filter} articles edited by the largest & smallest group of registered users (non bots or anon).
 *
 * @param {number} filter - The number of top articles need to be found, the number must be a positive integer.
 * @return {Promise} - Resolve search results if succeed, reject error if fail.
 */
const findTopArticlesByRegisteredUserCount = async (filter) => {
    try {
        const bots = await Bot.distinct('name')
        const results = await Revision.aggregate([
            {
                $match: {
                    user: {
                        $nin: bots
                    },
                    anon: false
                }
            },
            {
                $group: {
                    _id: '$title',
                    totalUsers: {
                        $addToSet: '$user'
                    }
                }
            },
            {
                $project: {
                    count: {
                        $size: '$totalUsers'
                    }
                }
            },
            {
                $sort: {
                    count: -1
                }
            }
        ])
        return {
            max: results.slice(0, filter),
            min: results.reverse().slice(0, filter)
        }
    } catch (err) {
        return new Error(err)
    }
}

/**
 * Find top {@param filter} articles with the longest & shortest history.
 *
 * @param {number} filter - The number of top articles need to be found, the number must be a positive integer.
 * @return {Promise} - Resolve search results if succeed, reject error if fail.
 */
const findTopArticlesByHistory = async (filter) => {
    try {
        const results = await Revision.aggregate([
            {
                $group: {
                    _id: '$title',
                    dates: {
                        $addToSet: '$timestamp'
                    }
                }
            },
            {
                $project: {
                    max: {
                        $max: '$dates'
                    },
                    min: {
                        $min: '$dates'
                    },
                }
            },
            {
                $project: {
                    age: {
                        $divide: [{$subtract: ["$max", "$min"]}, 3600000 * 24]
                    }
                }
            },
            {
                $sort: {
                    age: -1
                }
            }
        ])
        results.forEach(result => {
            result.age = Math.floor(result.age)
        })
        return {
            max: results.slice(0, filter),
            min: results.reverse().slice(0, filter)
        }
    } catch (err) {
        return new Error(err)
    }
}

/**
 * Find articles’ edited by a specific user, along with number of revisions and timestamps of all revisions made to
 * each article.
 *
 * @param {string} user - Name of the user.
 * @return {Promise} - Resolve search results if succeed, reject error if fail.
 */
const findRevisionsByUser = async (user) => {
    try {
        return await Revision.aggregate([
            {
                $match: {
                    user: user,
                    anon: false
                }
            },
            {
                $group: {
                    _id: '$title',
                    timestamps: {
                        $addToSet: '$timestamp'
                    },
                    count: {
                        $sum: 1
                    }
                }
            }
        ])
    } catch (err) {
        return new Error(err)
    }

}

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
 * Construct overall article revision distribution data for pie chart.
 * The data illustrates the revision number distribution by year and by user type across the whole dataset.
 *
 * @return {Promise} Resolve the pie chart data if succeed, reject error is fail.
 * */
const getRevisionDistributionDataForPieChart = async () => {
    try {
        const bots = await Bot.distinct('name')
        const admins = await Admin.distinct('name')
        const nonBotsOrAdmin = admins.concat(bots)
        // get revisions from bots.
        const [userCount, botRevCount, adminRevCount, anonRevCount, regularRevCount, totalRevCount] = await Promise.all([
            countDistinctUsers(),
            getRevisionCountByNameList(bots),
            getRevisionCountByNameList(admins),
            getRevisionCountByAnonymousUsers(),
            getRevisionCountByRegularUsers(nonBotsOrAdmin),
            countRevisions()
        ])
        return {
            totalUserCount: userCount,
            totalRevCount: totalRevCount,
            botRevCount: botRevCount,
            adminRevCount: adminRevCount,
            anonRevCount: anonRevCount,
            regularRevCount: regularRevCount
        }
    } catch (err) {
        throw new Error(err)
    }
}

/**
 * Count all distinct users.
 *
 * @return {number} The number of all distinct users.
 * */
const countDistinctUsers = async () => {
    try {
        const result = await Revision.distinct('user')
        return result.length
    } catch (err) {
        throw new Error(err)
    }
}

/**
 * Count the number of revisions made by users in a user list.
 * The function would be mainly used to count revisions made by administrators or bots.
 *
 * @param {Array} nameList - A list of users.
 *
 * @return {number} The number of revision made by a list of users.
 */
const getRevisionCountByNameList = async (nameList) => {
    try {
        const result = await Revision.aggregate([
            {
                $match: {
                    user: {
                        $in: nameList
                    }
                }
            },
            {
                $count: 'count'
            }
        ])
        return result[0].count
    } catch (err) {
        throw new Error(err)
    }
}

/**
 * Count the number of revisions made by anonymous users.
 *
 * @return {number} The number of revision made by anonymous users.
 */
const getRevisionCountByAnonymousUsers = async () => {
    try {
        return await Revision.find({anon: true}).countDocuments()
    } catch (err) {
        throw new Error(err)
    }
}

/**
 * Count the number of revisions made by regular users.
 * Regular users are users who are neither administrators nor bots nor anonymous users.
 *
 * @param {Array} nameList - A list of users.
 *
 * @return {number} The number of revision made by regualr users.
 */
const getRevisionCountByRegularUsers = async (nameList) => {
    try {
        const result = await Revision.aggregate([
            {
                $match: {
                    user: {
                        $nin: nameList
                    },
                    anon: false
                }
            },
            {
                $count: 'count'
            }
        ])
        return result[0].count
    } catch (err) {
        throw new Error(err)
    }
}

/**
 * Count the total number of revisions in the 'revisions' collection.
 *
 * @return {number} The total number of revisions.
 */
const countRevisions = async () => {
    try {
        return await Revision.count()
    } catch (err) {
        throw new Error(err)
    }
}

module.exports = {
    findAllAuthorNames,
    findRevisionsByUser,
    findTopArticlesByRevisionCount,
    findTopArticlesByRegisteredUserCount,
    findTopArticlesByHistory,
    findArticlesWithTitleAndRevisionCount,
    findLatestTimestamp,
    updateRevisions,
    getRevisionCountByArticle,
    getTopRegularUsersByArticle,
    getTopNewsByArticle,
    getRevisionDistributionDataForPieChart,
}
