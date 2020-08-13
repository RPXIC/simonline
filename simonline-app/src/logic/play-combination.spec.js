const { env: { REACT_APP_TEST_MONGODB_URL: TEST_MONGODB_URL } } = process
const { mongoose, models: { User, Game } } = require('simonline-data')
const { random } = Math
const { login, playCombination, logout } = require('.')
const bcrypt = require('bcryptjs')

describe('play-combination', () => {
    
    beforeAll(async () => {
        await mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        await Game.deleteMany()
        return await User.deleteMany()
    })
    
    let username, password, id, user, gameId, owner
    let combination = Math.floor(random() * 4)
    const name = `name-${random()}`
    let users = []
    let sendCombiantion = [combination]

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
        
        it("should retrieve new status game when player send matched combiantion", async() => {
            const game = await playCombination(gameId, sendCombiantion)
            expect.objectContaining(game)
            expect(game.pushCombination).toHaveLength(2)
            expect(game.currentPlayer).not.toBe(id)
        })

        it("should fail when user are not loged", async() => {
            try {
                await logout()
                await playCombination(gameId, sendCombiantion)
            } catch (error) {
                expect(error.message).toBe('jwt malformed')
            }
        })
    })

    describe('unhappy paths', () => {
        
        it("should fail when gameId is not a string", async() => {
            let fakeGameId = 1
            try {
                await playCombination(fakeGameId, sendCombiantion)
            } catch (error) {
                expect(error.message).toBe(`gameId ${fakeGameId} is not a string`)
            }

            fakeGameId = true
            try {
                await playCombination(fakeGameId, sendCombiantion)
            } catch (error) {
                expect(error.message).toBe(`gameId ${fakeGameId} is not a string`)
            }

            fakeGameId = undefined
            try {
                await playCombination(fakeGameId, sendCombiantion)
            } catch (error) {
                expect(error.message).toBe(`gameId ${fakeGameId} is not a string`)
            }

            fakeGameId = null
            try {
                await playCombination(fakeGameId, sendCombiantion)
            } catch (error) {
                expect(error.message).toBe(`gameId ${fakeGameId} is not a string`)
            }

            fakeGameId = ''
            try {
                await playCombination(fakeGameId, sendCombiantion)
            } catch (error) {
                expect(error.message).toBe('gameId is empty')
            }
        })

        it("should fail when sendCombination is not an array", async() => {
            sendCombiantion = 1
            try {
                await playCombination(gameId, sendCombiantion)
            } catch (error) {
                expect(error.message).toBe(`combination ${sendCombiantion} is not a object`)
            }

            sendCombiantion = true
            try {
                await playCombination(gameId, sendCombiantion)
            } catch (error) {
                expect(error.message).toBe(`combination ${sendCombiantion} is not a object`)
            }

            sendCombiantion = undefined
            try {
                await playCombination(gameId, sendCombiantion)
            } catch (error) {
                expect(error.message).toBe(`combination ${sendCombiantion} is not a object`)
            }

            sendCombiantion = ''
            try {
                await playCombination(gameId, sendCombiantion)
            } catch (error) {
                expect(error.message).toBe(`combination ${sendCombiantion} is not a object`)
            }
        })
    })
    afterAll(async () => {
        await User.deleteMany()
        await Game.deleteMany()
        return await mongoose.disconnect()
    })
})