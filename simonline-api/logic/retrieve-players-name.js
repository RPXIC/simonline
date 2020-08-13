const { validate } = require('simonline-utils')
const { models: { Game } } = require('simonline-data')

/**
 * Retrieve players id and name
 * 
 * @param {string} id of game
 * 
 * @returns {Promise<Object>} Array of Objects with id and username
 */

module.exports = async(gameId) => {
    validate.string(gameId, 'gameId')

    let playersName = []

    const game = await Game.findById(gameId).populate('players', 'username id')

    const { players } = game

    players.forEach(player => playersName.push({ id:player.id, username:player.username }))

    return playersName
}