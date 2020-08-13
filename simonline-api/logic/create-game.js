const { validate } = require('simonline-utils')
const { models: { Game } } = require('simonline-data')

/**
 * Create game and save on database
 * 
 * @param {string} name
 * @param {string} owner 
 * 
 * @returns {Promise<empty>} empty promise
 * 
 */

module.exports = async(name, owner) => {
    validate.string(name, 'name')
    validate.string(owner, 'owner')

    const game = new Game({ name, owner, players: [owner] })
    game.save()
}