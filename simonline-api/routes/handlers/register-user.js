const { registerUser } = require('../../logic')
const { NotAllowedError, ContentError } = require('simonline-errors')

module.exports = async(req, res) => {
    const { body: { username, password } } = req
    
    try {
        await registerUser(username, password)
        return res.status(201).end()
    } catch (error) {
        let status = 400
        if (error instanceof TypeError || error instanceof ContentError) status = 406
        if (error instanceof NotAllowedError) status = 409
        const { message } = error
        res.status(status).json({error: message})
    }
}