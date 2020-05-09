const Revision = require('../models/revision_model')
const Bot = require('../models/bot_model')
const Admin = require('../models/admin_model')

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
 * @return {number} The number of revision made by regular users.
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
    findTopArticlesByRevisionCount,
    findTopArticlesByRegisteredUserCount,
    findTopArticlesByHistory,
    getRevisionDistributionDataForPieChart
}
