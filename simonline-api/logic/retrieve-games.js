const { models: { Game } } = require('simonline-data')
const { sanitize } = require('simonline-utils')

/**
 * Retrieve all games from database
 * 
 * @returns {Promise<Object>} Array of Objects with all games created
 */

module.exports = async() => {
    const games = await Game.find({ 'status': 'waiting' })
    const sanitizedGames = games.map(game => sanitize(game))
    return sanitizedGames
}