const { validate } = require('simonline-utils')
const { models: { User } } = require('simonline-data')
const { NotAllowedError } = require('simonline-errors')
const bcrypt = require('bcryptjs')

/**
 * Register and save user on database
 * 
 * @param {string} username unique username
 * @param {string} password user's password
 * 
 * @returns {Promise<empty>} empty promise
 * 
 * @throws {NotAllowedError} when username exist
 */

module.exports = async(username, _password) => {
    validate.string(username, 'username')
    validate.string(_password, 'password')

    const userExist = await User.findOne({ username })
    if (userExist) throw new NotAllowedError(`User with username ${username} already exists`)
    const password = await bcrypt.hash(_password, 10)
    const user = new User({ username, password })
    user.save()
}