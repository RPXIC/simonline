const { validate } = require('simonline-utils')
const { models: { User, Game } } = require('simonline-data')
const { NotAllowedError } = require('simonline-errors')

/**
 * Register and save user on database
 * 
 * @param {string} id unique user id
 * @param {string} gameId unique game id
 * 
 * @returns {Promise} new data game
 * 
 * @throws {NotAllowedError} when player try to join game started
 */

module.exports = async(id, gameId) => {
    validate.string(id, 'id')
    validate.string(gameId, 'gameId')

    const [user, game] = await Promise.all([User.findById(id), Game.findById(gameId)])

    if (game.status === "started" || game.status === "finished") throw new NotAllowedError(`game ${game.name} already started`)
 
    if (user.id !== game.owner && !(game.players.includes(user.id))) game.players.push(user.id)
    
    return game.save()
}