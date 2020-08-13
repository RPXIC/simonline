const { env: { REACT_APP_TEST_MONGODB_URL: TEST_MONGODB_URL } } = process
const { mongoose, models: { User, Game } } = require('simonline-data')
const { random } = Math
const { login, startGame, logout } = require('.')
const bcrypt = require('bcryptjs')

describe('start-game', () => {
    
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

        //user2
        username = `username-${random()}`
        password = `password-${random()}`
        const cryptedPassword = await bcrypt.hash(password, 10)
        await User.create({ username, password:cryptedPassword })
    })

    describe('when game already exists', () => {
        
        it("should change status game when ower start game", async() => {
            const game = await startGame(gameId)
            expect(game.status).toBe('started')
        })

        it("should throw error when owner try to start a game started", async() => {
            try {
                await startGame(gameId)
            } catch (error) {
                expect(error.message).toBe(`game with id ${gameId} is started`)
            }
        })

        it("should throw error when not owner try start game", async() => {
            await login(username, password)

            try {
                await startGame(gameId)
            } catch (error) {
                expect(error.message).toBe(`only the owner ${owner} can start game`)
            }
        })

        it("should fail when user are not loged", async() => {
            try {
                await logout()
                await startGame(gameId)
            } catch (error) {
                expect(error.message).toBe('jwt malformed')
            }
        })
    })

    describe('unhappy paths', () => {
        
        it("should fail when gameId is not a string", async() => {
            gameId = 1
            try {
                await startGame(gameId)
            } catch (error) {
                expect(error.message).toBe(`gameId ${gameId} is not a string`)
            }

            gameId = true
            try {
                await startGame(gameId)
            } catch (error) {
                expect(error.message).toBe(`gameId ${gameId} is not a string`)
            }

            gameId = undefined
            try {
                await startGame(gameId)
            } catch (error) {
                expect(error.message).toBe(`gameId ${gameId} is not a string`)
            }

            gameId = null
            try {
                await startGame(gameId)
            } catch (error) {
                expect(error.message).toBe(`gameId ${gameId} is not a string`)
            }

            gameId = ''
            try {
                await startGame(gameId)
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