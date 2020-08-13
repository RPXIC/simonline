import context from './context'
const { validate } = require('simonline-utils')

const API_URL = process.env.REACT_APP_API_URL

export default (function (gameId) {
    validate.string(gameId, 'gameId')

    return (async () => {
        const response = await fetch(`${API_URL}/users/games/${gameId}/players`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.user.token}`
            }
        })
        
        const { status } = response

        if (status === 200) {
            const players = await response.json()
            return players
        }

        const { error } = await response.json()
        throw new Error(error)
    })()
}).bind(context)