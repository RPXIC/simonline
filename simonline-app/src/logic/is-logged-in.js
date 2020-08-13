import context from './context'

export default (function () {
    return Boolean(this.user)
}).bind(context)