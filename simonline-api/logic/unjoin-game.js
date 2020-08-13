const { validate } = require('simonline-utils')
const { models: { User, Game } } = require('simonline-data')
const { NotAllowedError } = require('simonline-errors')

/**
 * Remove user on game joined
 * 
 * @param {string} id unique user id
 * @param {string} gameId unique game id
 * 
 * @returns {Promise<Object>} new game status
 * 
 * @throws {NotFoundError} when user id no exist
 * @throws {NotFoundError} when game id no exist
 * @throws {NotAllowedError} when player try unjoin on game started
 */

module.exports = async(id, gameId) => {
    validate.string(id, 'id')
    validate.string(gameId, 'gameId')

    const [user, game] = await Promise.all([User.findById(id), Game.findById(gameId)])

    if (game.status === "started") throw new NotAllowedError(`game ${game.name} already start`)
    if (game.status === "finished") throw new NotAllowedError(`game ${game.name} already finished`)

    const userId = user._id.toString()
    const gameOwner = game.owner.toString()

    if (userId !== gameOwner && (game.players.includes(userId))) {
        game.players = game.players.filter(player => player.toString() !== userId)
    }
    
    Promise.all([game.save()])
    return game
}