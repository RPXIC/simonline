import context from './context'
import { NotAllowedError } from 'simonline-errors'

const API_URL = process.env.REACT_APP_API_URL

export default (function (gameId) {
    return (async () => {
        const response = await fetch(`${API_URL}/users/games/${gameId}/retrieve`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${this.user.token}` }
        })
        
        const { status } = response

        if (status === 200) {
            const gameStatus = await response.json()

            return gameStatus
        }

        if (status >= 400 && status < 500) {
            const { error } = await response.json()

            if (status === 401) throw new NotAllowedError(error)

            throw new Error(error)
        }
    })()
}).bind(context)