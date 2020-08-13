export default {
    set user(user) {
        sessionStorage.user = JSON.stringify(user)
    },

    get user() {
        if (sessionStorage.user) return JSON.parse(sessionStorage.user)
        else return false
    },

    clear() {
        sessionStorage.clear()
    }
}