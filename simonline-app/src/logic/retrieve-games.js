import context from './context'

const API_URL = process.env.REACT_APP_API_URL

export default (function () {
    return (async () => {
        const response = await fetch(`${API_URL}/games`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.user.token}`
            }
        })

        const { status } = response

        if (status === 200) {
            const games = await response.json()
            return games
        }
        const { error } = await response.json()
        throw new Error(error)
    })()
}).bind(context)