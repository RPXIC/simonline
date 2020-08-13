const semaphores = {}

class Semaphore {
    constructor() {
        this.light = 'green'
    }

    setGreen() { this.light = 'green' }

    isGreen() { return this.light === 'green' }

    setRed() { this.light = 'red' }

    isRed() { return this.light === 'red' }
}

module.exports = function(id, handle) {
    
    const semaphore = semaphores[id] || (semaphores[id] = new Semaphore())

        ; (function check() {
            if (semaphore.isGreen()) return handle(semaphore)

            setTimeout(check, 0)
        })()
}