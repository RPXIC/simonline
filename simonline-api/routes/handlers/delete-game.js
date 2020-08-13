const { deleteGame } = require('../../logic')
const { NotFoundError, TypeError, ContentError } = require('simonline-errors')

module.exports = async(req, res) => {
    const { params: { gameId } } = req

    try {
        await deleteGame(gameId)
        return res.status(200).end()
    } catch (error) {
        let status = 400
        if (error instanceof NotFoundError) status = 404
        if (error instanceof TypeError || error instanceof ContentError) status = 406
        const { message } = error
        res.status(status).json({error:message})
    }
}