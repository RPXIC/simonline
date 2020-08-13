const { validate, sanitize } = require('simonline-utils')
const { models: { User } } = require('simonline-data')
const { NotAllowedError } = require('simonline-errors')
const bcrypt = require('bcryptjs')

/**
 * Checks user credentials against the storage
 * 
 * @param {string} username unique username
 * @param {string} password user's password
 * 
 * @returns {Promise<object>} user data from db
 * 
 * @throws {NotAllowedError} on wrong credentials
 */

module.exports = async(username, password) => {
    validate.string(username, 'username')
    validate.string(password, 'password')

    const user = await User.findOne({ username })
    if (!user) throw new NotAllowedError(`Wrong credentials`)
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) throw new NotAllowedError(`Wrong credentials`)
    return sanitize(user)
}