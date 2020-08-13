import context from './context'
const { validate } = require('simonline-utils')

const API_URL = process.env.REACT_APP_API_URL

export default (function (id, gameId) {
    validate.string(id, 'id')
    validate.string(gameId, 'gameId')

    return (async () => {

        const join = await fetch(`${API_URL}/users/${id}/games/${gameId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.user.token}` },
        })

        const { status } = join
        if (status === 200) {
            const game = await join.json()
            return game
        }
                
        const { error } = await join.json()

        if (status === 400) throw new Error(error)
    })()
}).bind(context)