const { env: { REACT_APP_TEST_MONGODB_URL: TEST_MONGODB_URL } } = process
const { mongoose, models: { User, Game } } = require('simonline-data')
const { random } = Math
const { login, deleteGame, logout } = require('.')
const bcrypt = require('bcryptjs')

describe('delete-game', () => {
    
    beforeAll(async () => {
        await mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        await Game.deleteMany()
        return await User.deleteMany()
    })
    
    let username, password, id, user, gameId, owner
    let combination = Math.floor(random() * 4)
    const name = `name-${random()}`
    let users = []

    beforeAll(async () => {
        //users
        for (let i = 0; i < 3; i++) {
            username = `username-${random()}`
            password = `password-${random()}`
            const cryptedPassword = await bcrypt.hash(password, 10)
            user = await User.create({ username, password:cryptedPassword })
            id = user._id.toString()
            owner = user._id.toString()
            users.push(user._id)
        }

        //set data context
        await login(username, password)
        
        //game
        const game = await Game.create({ name, owner })
        game.players = users
        gameId = game.id
        game.pushCombination.push(combination)
        game.turnStart = new Date()
        game.currentPlayer = id
        game.status = "waiting"
        game.turnTimeout = 20
        await game.save()
    })

    describe('when user already exists', () => {
        
        it("player delete a game", async() => {
            const deleted = await deleteGame(gameId)
            expect(deleted).toBeUndefined()
        })

        it("should fail when user are not loged", async() => {
            try {
                await logout()
                await deleteGame(gameId)
            } catch (error) {
                expect(error.message).toBe('jwt malformed')
            }
        })
    })

    describe('unhappy paths', () => {

        it("should fail on id is not a string", async() => {
            gameId =  1
            try {
                await deleteGame(gameId)
            } catch (error) {
                expect(error.message).toBe(`gameId ${gameId} is not a string`)
            }

            gameId = true
            try {
                await deleteGame(gameId)
            } catch (error) {
                expect(error.message).toBe(`gameId ${gameId} is not a string`)
            }

            gameId = undefined
            try {
                await deleteGame(gameId)
            } catch (error) {
                expect(error.message).toBe(`gameId ${gameId} is not a string`)
            }

            gameId = null
            try {
                await deleteGame(gameId)
            } catch (error) {
                expect(error.message).toBe(`gameId ${gameId} is not a string`)
            }

            gameId = ''
            try {
                await deleteGame(gameId)
            } catch (error) {
                expect(error.message).toBe('gameId is empty')
            }
        })
    })
    afterAll(async () => {
        await User.deleteMany()
        await Game.deleteMany()
        return await mongoose.disconnect()
    })
})