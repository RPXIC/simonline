import context from './context'

const API_URL = process.env.REACT_APP_API_URL

export default (function (token) {
    return (async () => {
        const response = await fetch(`${API_URL}/users`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token || this.user.token}`
            }
        })
        
        const { status } = response
        
        if (status === 200) {
            const user = await response.json()
            return user
        }
        
        if (status >= 400 && status < 500) {
            const { error } = await response.json()
            throw new Error(error)
        }
    })()
}).bind(context)