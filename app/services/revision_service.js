const request = require('request-promise')
const isIp = require('is-ip')
const Revision = require('../models/revision_model')
const Bot = require('../models/bot_model')

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
 * Find top {@param filter} articles edited by the largest & smallest group of registered users (non bots).
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
                    }
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

        console.log(revisions.length, revisions)
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
        return new Error(err)
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
    updateRevisions
}
