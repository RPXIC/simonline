const { retrieveGameStatus } = require('../../logic')

module.exports = async(req, res) => {
    const { params: { gameId }, payload: {sub: {id: playerId}} } = req

    try {
        const gameStatus = await retrieveGameStatus(playerId, gameId)
        return res.status(200).json(gameStatus)
    } catch (error) {
        let status = 400
        const { message } = error
        res.status(status).json({error: message})
    }
}