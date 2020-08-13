const { startGame } = require('../../logic')
const { NotFoundError, NotAllowedError, ContentError } = require('simonline-errors')

module.exports = async(req, res) => {
    const { params: { gameId }, payload: { sub: {id: playerId} } } = req

    try {
        const game = await startGame(playerId, gameId)
        res.status(200).json(game)
    } catch (error) {
        let status = 400
        if (error instanceof NotFoundError) status = 404
        if (error instanceof NotAllowedError) status = 405
        if (error instanceof TypeError || error instanceof ContentError) status = 406
        const { message } = error
        res.status(status).json({error: message})
    }
}