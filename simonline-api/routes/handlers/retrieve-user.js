const { retrieveUser } = require('../../logic')
const { TypeError, NotAllowedError, ContentError } = require('simonline-errors')

module.exports = async(req, res) => {
    const { payload: { sub: { id } } } = req

    try {
        const user = await retrieveUser(id)
        return res.status(200).json(user)
    } catch (error) {
        let status = 400
        if (error instanceof NotAllowedError) status = 401
        if (error instanceof TypeError || error instanceof ContentError) status = 406
        const { message } = error
        res.status(status).json({error: message})
    }
}