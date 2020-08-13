const { validate } = require('simonline-utils')

const API_URL = process.env.REACT_APP_API_URL

export default function (name, owner) {
    validate.string(name, 'name')
    validate.string(owner, 'owner')

    return (async () => {

        const create = await fetch(`${API_URL}/games`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, owner })
        })

        const { status } = create

        if (status === 201) return
    })()
}