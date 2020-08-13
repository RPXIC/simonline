import context from './context'

export default (function () {
    this.clear()
    window.location.assign('/')
}).bind(context)