const { retrievePlayersName } = require('../../logic')
const { NotAllowedError, TypeError, ContentError } = require('simonline-errors')

module.exports = async(req, res) => {
    const { params: { gameId } } = req

    try {
        const players = await retrievePlayersName(gameId)
        return res.status(200).json(players)
    } catch (error) {
        let status = 400
        if (error instanceof NotAllowedError) status = 401
        if (error instanceof TypeError || error instanceof ContentError) status = 406
        const { message } = error
        res.status(status).json({error: message})
    }
}