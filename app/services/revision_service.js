const Revision = require('../models/revision_model')

const findAllAuthorNames = async () => {
    try {
        return await Revision.distinct('user')
    } catch (err) {
        return err
    }

}

module.exports = {
    findAllAuthorNames
}
