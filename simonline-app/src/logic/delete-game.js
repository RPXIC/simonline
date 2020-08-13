import context from './context'
const { validate } = require('simonline-utils')

const API_URL = process.env.REACT_APP_API_URL

export default (function (gameId) {
    validate.string(gameId, 'gameId')

    return (async () => {
        const deleteGame = await fetch(`${API_URL}/games/${gameId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.user.token}` 
            }
        })

        const { status } = deleteGame

        if (status === 200) return
        
        const { error } = await deleteGame.json()
        throw new Error(error)
    })()
}).bind(context)