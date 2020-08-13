const { validate } = require('simonline-utils')
const { models: { User } } = require('simonline-data')

/**
 * Retrieve username from database with id
 * 
 * @param {string} id of player
 * 
 * @returns {Promise<String>} username
 * 
 * @throws {NotAllowedError} when not found user
 */

module.exports = async(id) => {
    validate.string(id, 'id')

    const user = await User.findById(id)
    user.retrieved = new Date
    const { username } = await user.save()
    return username
}