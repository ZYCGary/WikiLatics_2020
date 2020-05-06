const Revision = require('../models/revision_model')
const Bot = require('../models/bot_model')

/**
 * Find the name list of all distinct article editors/users.
 *
 * @return {Promise} - Resolve the list of  editor/user names if succeed, reject error if fail.
 */
const findAllAuthorNames = async () => {
    try {
        return await Revision.distinct('user')
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
        return {
            max: results.slice(0, filter),
            min: results.reverse().slice(0, filter)
        }
    } catch (err) {
        return new Error(err)
    }
}

module.exports = {
    findAllAuthorNames,
    findTopArticlesByRevisionCount,
    findTopArticlesByRegisteredUserCount,
    findTopArticlesByHistory
}
