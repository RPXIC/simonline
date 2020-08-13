const { validate, sanitize } = require('simonline-utils')
const { models: { Game } } = require("simonline-data")

/**
 * Play combination of flayer in game and match with game combination
 * 
 * @param {string} gameId unique game id
 * @param {Object} combination array sent of player in game
 * 
 * @returns {Promise<Object>} status game
 */

module.exports = async(gameId, combination) => {
    validate.string(gameId, 'gameId')
    validate.type(combination, 'combination', Object)
    
    const game = await Game.findById(gameId).lean()
    
    const playersStr = []
    game.players.forEach(player => playersStr.push(player.toString()))

    const watchingStr = []
    if (game.watching.length > 0) game.watching.forEach(watcher => watchingStr.push(watcher.toString()))

    const currentPlayerStr = game.currentPlayer.toString()

    const timeNow = new Date()

    const elapsedTime = (timeNow - game.turnStart) / 1000

    let matched = true

    for (let i = 0; i < game.pushCombination.length; i++) {
        if (game.pushCombination[i] !== combination[i]) matched = false
    }

    const index = playersStr.indexOf(currentPlayerStr)

    if (elapsedTime < game.turnTimeout && matched) {

        for (let i = index+1; i < playersStr.length; i++) {
            if (!watchingStr.includes(playersStr[i]) && currentPlayerStr !== playersStr[i]) {
                const newPushCombination = Math.floor(Math.random() * 4)
                game.pushCombination.push(newPushCombination)
                game.turnTimeout = (20 + (game.pushCombination.length * 3))
                game.turnStart = new Date()
                game.currentPlayer = game.players[i]

                const newGame = await Game.findByIdAndUpdate(gameId, game, {new: true})
                return sanitize(newGame)
            }
        }

        for (let i = 0; i < playersStr.length; i++) {
            if (!watchingStr.includes(playersStr[i]) && currentPlayerStr !== playersStr[i]) {
                const newPushCombination = Math.floor(Math.random() * 4)
                game.pushCombination.push(newPushCombination)
                game.turnTimeout = (20 + (game.pushCombination.length * 3))
                game.turnStart = new Date()
                game.currentPlayer = game.players[i]

                const newGame = await Game.findByIdAndUpdate(gameId, game, {new: true})
                return sanitize(newGame)
            }
        }
    } else if (elapsedTime < game.turnTimeout && !matched ) {
        game.watching.push(game.currentPlayer)
        watchingStr.push(currentPlayerStr)
        
        if (game.players.length === (game.watching.length + 1)) {

            for (let i = index+1; i < game.players.length; i++) {
                if (!watchingStr.includes(playersStr[i])) {
                    game.currentPlayer = game.players[i]
                    game.status = 'finished'

                    const newGame = await Game.findByIdAndUpdate(gameId, game, {new: true})
                    return sanitize(newGame)
                }
            }

            for (let i = 0; i < game.players.length; i++) {
                if (!watchingStr.includes(playersStr[i])) {
                    game.currentPlayer = game.players[i]
                    game.status = 'finished'

                    const newGame = await Game.findByIdAndUpdate(gameId, game, {new: true})
                    return sanitize(newGame)
                }
            }
        }
                
        for (let i = index+1; i < playersStr.length; i++) {
            if (!watchingStr.includes(playersStr[i]) && currentPlayerStr !== playersStr[i]) {
                game.currentPlayer = game.players[i]
                game.turnTimeout = (20 + (game.pushCombination.length * 3))
                game.combinationViewed = []
                game.turnStart = new Date()

                const newGame = await Game.findByIdAndUpdate(gameId, game, {new: true})
                return sanitize(newGame)
            }
        }

        for (let i = 0; i < playersStr.length; i++) {
            if (!watchingStr.includes(playersStr[i]) && currentPlayerStr !== playersStr[i]) {
                game.currentPlayer = game.players[i]
                game.turnTimeout = (20 + (game.pushCombination.length * 3))
                game.combinationViewed = []
                game.turnStart = new Date()

                const newGame = await Game.findByIdAndUpdate(gameId, game, {new: true})
                return sanitize(newGame)
            }
        }
    }
    return sanitize(game)
}