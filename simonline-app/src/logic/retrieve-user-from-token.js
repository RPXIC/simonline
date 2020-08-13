const { validate } = require('simonline-utils')

export default function (token) {
    validate.string(token, 'token')

    const [header, payload, signature] = token.split('.')
    if (!header || !payload || !signature) throw new Error('invalid token')

    const { sub } = JSON.parse(atob(payload))

    return sub
}