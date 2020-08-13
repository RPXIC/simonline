import context from './context'
const { validate } = require('simonline-utils')

const API_URL = process.env.REACT_APP_API_URL

export default (function (gameId) {
    validate.string(gameId, 'gameId')

    return (async () => {

        const res = await fetch(`${API_URL}/users/games/${gameId}/start`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.user.token}` },
        })

        const { status } = res
        
        if (status === 200) {
            const game = await res.json()
            return game
        }

        if (status === 409 || status === 406 || status === 403 || status === 405) {
            const { error } = await res.json()
            throw new Error(error)
        }
    })()
}).bind(context)