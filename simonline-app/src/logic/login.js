import { validate } from 'simonline-utils'
import { NotAllowedError } from 'simonline-errors'
import context from './context'

const API_URL = process.env.REACT_APP_API_URL

export default (function (username, password) {
    validate.string(username, 'username')
    validate.string(password, 'password')

    return (async () => {
        const res = await fetch(`${API_URL}/users/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        })

        const { status } = res

        if (status === 200) {
            const user = await res.json()
            this.user = user
            return user
        }

        if (status >= 400 && status < 500) {
            const { error } = await res.json()
            if (status === 401) throw new NotAllowedError(error)
        }
    })()
}).bind(context)