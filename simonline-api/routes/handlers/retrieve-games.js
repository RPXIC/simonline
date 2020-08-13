const { retrieveGames } = require('../../logic')
const { NotAllowedError, ContentError } = require('simonline-errors')

module.exports = async(req, res) => {
    try {
        const games = await retrieveGames()
        return res.status(200).json(games)
    } catch (error) {
        let status = 400
        if (error instanceof NotAllowedError) status = 401
        if (error instanceof TypeError || error instanceof ContentError) status = 406
        const { message } = error
        res.status(status).json({error: message})
    }
}