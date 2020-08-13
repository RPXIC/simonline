const { env: { REACT_APP_TEST_MONGODB_URL: TEST_MONGODB_URL } } = process
const { mongoose, models: { User, Game } } = require('simonline-data')
const { random } = Math
const { login, join, logout } = require('.')
const bcrypt = require('bcryptjs')

describe('join', () => {
    
    beforeAll(async () => {
        await mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        await Game.deleteMany()
        return await User.deleteMany()
    })
    
    let username, password, id, user, gameId, owner, user2, id2, gameId2, gameName2, gameId3, gameName3
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

        //user to join
        username = `username-${random()}`
        password = `password-${random()}`
        const cryptedPassword = await bcrypt.hash(password, 10)
        user2 = await User.create({ username, password:cryptedPassword })
        id2 = user2._id.toString()

        //game2
        const game2 = await Game.create({ name, owner })
        gameId2 = game2.id
        gameName2 = game2.name
        game2.pushCombination.push(combination)
        game2.turnStart = new Date()
        game2.status = "finished"
        game2.turnTimeout = 20
        await game2.save()

        //game3
        const game3 = await Game.create({ name, owner })
        gameId3 = game3.id
        gameName3 = game3.name
        game3.players = users
        game3.pushCombination.push(combination)
        game3.turnStart = new Date()
        game3.status = "started"
        game3.turnTimeout = 20
        await game3.save()
    })

    describe('when user and game already exists, and new user join in game', () => {
        
        it("user joining in game", async() => {
            const game = await join(id2, gameId)
            expect(game.players.length).toBe(4)
            expect(game.players).toContain(id2)
        })

        it("user join again in same game do nothing", async() => {
            const game = await join(id2, gameId)
            expect(game.players.length).toBe(4)
            expect(game.players).toContain(id2)
        })
    })

    describe('when user try to join in game started or finished', () => {
        
        it("should throw error on started", async() => {
            try {
                await join(id2, gameId2)
            } catch (error) {
                expect(error.message).toBe(`game ${gameName2} already started`)
            }
        })

        it("should throw error on started", async() => {
            try {
                await join(id2, gameId3)
            } catch (error) {
                expect(error.message).toBe(`game ${gameName3} already started`)
            }
        })

        it("should fail when user are not loged", async() => {
            try {
                await logout()
                await join(id2, gameId3)
            } catch (error) {
                expect(error.message).toBe('jwt malformed')
            }
        })
    })

    describe('unhappy paths', () => {

        it("should fail on id is not a string", async() => {
            id2 = 1
            try {
                await join(id2, gameId)
            } catch (error) {
                expect(error.message).toBe(`id ${id2} is not a string`)
            }

            id2 = true
            try {
                await join(id2, gameId)
            } catch (error) {
                expect(error.message).toBe(`id ${id2} is not a string`)
            }

            id2 = undefined
            try {
                await join(id2, gameId)
            } catch (error) {
                expect(error.message).toBe(`id ${id2} is not a string`)
            }

            id2 = null
            try {
                await join(id2, gameId)
            } catch (error) {
                expect(error.message).toBe(`id ${id2} is not a string`)
            }

            id2 = ''
            try {
                await join(id2, gameId)
            } catch (error) {
                expect(error.message).toBe('id is empty')
            }
        })

        it("should fail on gameId is not a string", async() => {
            id2 = user2._id.toString()
            gameId =  1
            try {
                await join(id2, gameId)
            } catch (error) {
                expect(error.message).toBe(`gameId ${gameId} is not a string`)
            }

            gameId = true
            try {
                await join(id2, gameId)
            } catch (error) {
                expect(error.message).toBe(`gameId ${gameId} is not a string`)
            }

            gameId = undefined
            try {
                await join(id2, gameId)
            } catch (error) {
                expect(error.message).toBe(`gameId ${gameId} is not a string`)
            }

            gameId = null
            try {
                await join(id2, gameId)
            } catch (error) {
                expect(error.message).toBe(`gameId ${gameId} is not a string`)
            }

            gameId = ''
            try {
                await join(id2, gameId)
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