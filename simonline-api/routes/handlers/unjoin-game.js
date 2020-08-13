const { unjoinGame } = require('../../logic')
const { NotFoundError ,ContentError } = require('simonline-errors')

module.exports = async(req, res) => {
    const { params: { id, gameId } } = req

    try {
        const game = await unjoinGame(id, gameId)
        return res.status(200).json(game)
    } catch (error) {
        let status = 400
        if (error instanceof NotFoundError) status = 404
        if (error instanceof TypeError || error instanceof ContentError) status = 406 
        const { message } = error
        res.status(status).json({error: message})
    }
}