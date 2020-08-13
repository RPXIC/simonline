const { env: { REACT_APP_TEST_MONGODB_URL: TEST_MONGODB_URL } } = process
const { mongoose, models: { User, Game } } = require('simonline-data')
const { random } = Math
const { login, retrievePlayersBasicData, logout } = require('.')
const bcrypt = require('bcryptjs')

describe('retrieve-players-basic-data', () => {
    
    beforeAll(async () => {
        await mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        await Game.deleteMany()
        return await User.deleteMany()
    })
    
    let username, password, id, user, gameId, owner, gameId2
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
        
        it("should return array of objects with players id and name", async() => {
            const players = await retrievePlayersBasicData(gameId)
            expect.arrayContaining(players)
            expect(players).toHaveLength(3)
            expect.objectContaining(players[0])
            expect(players[0]).toHaveProperty('id')
            expect(players[0]).toHaveProperty('username')
        })

        it("should fail when user are not loged", async() => {
            try {
                await logout()
                await retrievePlayersBasicData(gameId)
            } catch (error) {
                expect(error.message).toBe('jwt malformed')
            }
        })
    })

    describe('unhappy paths', () => {
        
        it("should fail when gameId is not a string", async() => {
            gameId = 1
            try {
                await retrievePlayersBasicData(gameId)
            } catch (error) {
                expect(error.message).toBe(`gameId ${gameId} is not a string`)
            }

            gameId = true
            try {
                await retrievePlayersBasicData(gameId)
            } catch (error) {
                expect(error.message).toBe(`gameId ${gameId} is not a string`)
            }

            gameId = undefined
            try {
                await retrievePlayersBasicData(gameId)
            } catch (error) {
                expect(error.message).toBe(`gameId ${gameId} is not a string`)
            }

            gameId = null
            try {
                await retrievePlayersBasicData(gameId)
            } catch (error) {
                expect(error.message).toBe(`gameId ${gameId} is not a string`)
            }

            gameId = ''
            try {
                await retrievePlayersBasicData(gameId)
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