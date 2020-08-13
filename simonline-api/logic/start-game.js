const validate = require('simonline-utils/validate')
require('../../simonline-utils/shuffle')()
const { models: { Game } } = require('simonline-data')
const { NotAllowedError } = require('simonline-errors')
const { random } = Math 

/**
 * Start game
 * 
 * @param {string} id of player
 * @param {string} id of game
 * 
 * @returns {Promise<empty>} empty promise
 * 
 * @throws {NotFoundError} when not found game
 * @throws {NotAllowedError} when not the owner try start game
 * @throws {NotAllowedError} when owner try start game again
 * 
 */

module.exports = async(playerId, gameId) => {
    validate.string(playerId, 'playerId')
    validate.string(gameId, 'gameId')

    const game = await Game.findById(gameId).populate('players', 'username id')
    
    if(game.owner.toString() !== playerId) throw new NotAllowedError(`only the owner ${game.owner} can start game`)

    if (game.status === "started") throw new NotAllowedError(`game with id ${gameId} is started`)
    
    const combination = Math.floor(random() * 4)
    
    game.date = new Date()
    game.players.shuffle()
    game.pushCombination.push(combination)
    game.turnStart = new Date()
    game.currentPlayer = game.players[0]
    game.status = "started"
    game.turnTimeout = 20

    game.save()
    return game
}
