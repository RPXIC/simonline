const { validate } = require('simonline-utils')
const { models: { Game } } = require('simonline-data')
const { NotFoundError } = require('simonline-errors')

/**
 * Delete game from database
 * 
 * @param {string} gameId
 * 
 * @returns {Promise<empty>} empty promise
 * 
 * @throws {NotFoundError} when not found gameId
 */

module.exports = async(gameId) => {
    validate.string(gameId, 'gameId')

    const game = await Game.findById(gameId)
    if(!game) throw new NotFoundError(`game with id ${gameId} does not exist`)
    await Game.findByIdAndDelete({ _id: gameId })
}