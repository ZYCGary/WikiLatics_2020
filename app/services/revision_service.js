const Revision = require('../models/revision_model')

const findAllAuthorNames = async () => {
    try {
        return await Revision.distinct('user')
    } catch (err) {
        return err
    }

}

/**
 * Find top {@param filter} articles with the highest & smallest number of revisions.
 *
 * @param {number} filter - The number of top articles need to be found.
 *
 * @return {Promise} - Resolve search results if succeed, reject error if fail.
 */
const findTopArticlesByRevisionCount = async (filter) => {

}

/**
 * Find top {@param filter} articles edited by the largest & smallest group of registered users (non bots).
 *
 * @param {number} filter - The number of top articles need to be found.
 *
 * @return {Promise} - Resolve search results if succeed, reject error if fail.
 */
const findTopArticlesByRegisteredUserCount = async (filter) => {

}

/**
 * Find top {@param filter} articles with the longest & shortest history.
 *
 * @param {number} filter - The number of top articles need to be found.
 *
 * @return {Promise} - Resolve search results if succeed, reject error if fail.
 */
const findTopArticlesByHistory = async (filter) => {

}

module.exports = {
    findAllAuthorNames,
    findTopArticlesByRevisionCount,
    findTopArticlesByRegisteredUserCount,
    findTopArticlesByHistory
}
