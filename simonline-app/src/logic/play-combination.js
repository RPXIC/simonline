import context from './context'
const { validate } = require('simonline-utils')

const API_URL = process.env.REACT_APP_API_URL

export default (function (gameId, combination) {
    validate.string(gameId, 'gameId')
    validate.type(combination, 'combination', Object)

    return (async () => {
        const game = await fetch(`${API_URL}/users/games/${gameId}/playcombination`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.user.token}` },
            body: JSON.stringify({ combination })
        })

        const { status } = game

        if (status === 200) {
            const gameStatus = await game.json()
            return gameStatus
        }

        const { error } = await game.json()
        throw new Error(error)
    })()
}).bind(context)