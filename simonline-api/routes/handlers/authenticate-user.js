const { authenticateUser } = require('../../logic')
const jwt = require('jsonwebtoken')
const { env: { JWT_SECRET, JWT_EXP } } = process
const { NotAllowedError, ContentError } = require('simonline-errors')

module.exports = async(req, res) => {
    const { body: { username, password } } = req
    
    try {
        const user = await authenticateUser(username, password)
        const token = jwt.sign({ sub: user }, JWT_SECRET, { expiresIn: JWT_EXP })
        const { id, username:_username } = user
        res.status(200).json({ id, username:_username, token })
    } catch (error) {
        let status = 400
        if (error instanceof NotAllowedError) status = 401
        if (error instanceof TypeError || error instanceof ContentError) status = 406
        const { message } = error
        res.status(status).json({error: message})
    }
}