const { env: { REACT_APP_TEST_MONGODB_URL: TEST_MONGODB_URL } } = process
const { mongoose, models: { User, Game } } = require('simonline-data')
const { random } = Math
const { login, unjoin, logout } = require('.')
const bcrypt = require('bcryptjs')

describe('unjoin', () => {
    
    beforeAll(async () => {
        await mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        await Game.deleteMany()
        return await User.deleteMany()
    })
    
    let username, password, id, user, gameId, owner, gameId2, id2, gameId3, gameName3, gameId4, gameName4
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
        id2 = user._id.toString()

        //game2
        const game2 = await Game.create({ name, owner })
        gameId2 = game2.id
        game2.pushCombination.push(combination)
        game2.turnStart = new Date()
        game2.status = "waiting"
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

        //game4
        const game4 = await Game.create({ name, owner })
        gameId4 = game4.id
        gameName4 = game4.name
        game4.players = users
        game4.pushCombination.push(combination)
        game4.turnStart = new Date()
        game4.status = "finished"
        game4.turnTimeout = 20
        await game4.save()
    })

    describe('when user already exists', () => {
        
        it("owner can't unjoin of game", async() => {
            const game = await unjoin(id, gameId)
            expect(game.players).toContain(owner)
        })

        it("should the 2nd player are unjoined", async() => {
            id = users[1].toString()
            const game = await unjoin(id, gameId)
            expect(game.players).not.toContain(id)
        })
    })

    describe('should fail when user try unjoin other game or try unjoin on not joined game', () => {
        
        it('sould do nothing if unjoin when is not joined', async() => {
            try {
                await unjoin(id2, gameId2)
            } catch (error) {
                expect(error).toBeUndefined()
            }
        })

        it('should throw error when game is started', async() => {
            try {
                await unjoin(id2, gameId3)
            } catch (error) {
                expect(error.message).toBe(`game ${gameName3} already start`)
            }
        })

        it('should throw error when game is finished', async() => {
            try {
                await unjoin(id2, gameId4)
            } catch (error) {
                expect(error.message).toBe(`game ${gameName4} already finished`)
            }
        })

        it("should fail when user are not loged", async() => {
            try {
                await logout()
                await unjoin(id2, gameId4)
            } catch (error) {
                expect(error.message).toBe('jwt malformed')
            }
        })
    })

    describe('unhappy paths', () => {
        
        it("should fail when id is not a string", async() => {
            id = 1
            try {
                await unjoin(id, gameId)
            } catch (error) {
                expect(error.message).toBe(`id ${id} is not a string`)
            }

            id = true
            try {
                await unjoin(id, gameId)
            } catch (error) {
                expect(error.message).toBe(`id ${id} is not a string`)
            }

            id = undefined
            try {
                await unjoin(id, gameId)
            } catch (error) {
                expect(error.message).toBe(`id ${id} is not a string`)
            }

            id = null
            try {
                await unjoin(id, gameId)
            } catch (error) {
                expect(error.message).toBe(`id ${id} is not a string`)
            }

            id = ''
            try {
                await unjoin(id, gameId)
            } catch (error) {
                expect(error.message).toBe('id is empty')
            }
        })

        it("should fail on id is not a string", async() => {
            id = users[0].toString()
            gameId =  1
            try {
                await unjoin(id, gameId)
            } catch (error) {
                expect(error.message).toBe(`gameId ${gameId} is not a string`)
            }

            gameId = true
            try {
                await unjoin(id, gameId)
            } catch (error) {
                expect(error.message).toBe(`gameId ${gameId} is not a string`)
            }

            gameId = undefined
            try {
                await unjoin(id, gameId)
            } catch (error) {
                expect(error.message).toBe(`gameId ${gameId} is not a string`)
            }

            gameId = null
            try {
                await unjoin(id, gameId)
            } catch (error) {
                expect(error.message).toBe(`gameId ${gameId} is not a string`)
            }

            gameId = ''
            try {
                await unjoin(id, gameId)
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