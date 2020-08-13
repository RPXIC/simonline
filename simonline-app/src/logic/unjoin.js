import context from './context'
const { validate } = require('simonline-utils')

const API_URL = process.env.REACT_APP_API_URL

export default (function (id, gameId) {
    validate.string(id, 'id')
    validate.string(gameId, 'gameId')

    return (async () => {

        const unjoin = await fetch(`${API_URL}/users/${id}/games/${gameId}/unjoin`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.user.token}` },
        })

        const { status } = unjoin

        if (status === 200) {
            const players = await unjoin.json()
            return players
        }
        
        const { error } = await unjoin.json()
        throw new Error(error)
    })()
}).bind(context)