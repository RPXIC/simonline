const { env: { REACT_APP_TEST_MONGODB_URL: TEST_MONGODB_URL } } = process
const { mongoose, models: { User, Game } } = require('simonline-data')
const { random } = Math
const { login, createGame } = require('.')
const bcrypt = require('bcryptjs')

describe('create-game', () => {
    
    beforeAll(async () => {
        await mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        await Game.deleteMany()
        return await User.deleteMany()
    })
    
    let username, password, id, user, owner
    let name = `name-${random()}`

    beforeAll(async () => {
        //user
        username = `username-${random()}`
        password = `password-${random()}`
        const cryptedPassword = await bcrypt.hash(password, 10)
        user = await User.create({ username, password:cryptedPassword })
        id = user._id.toString()
        owner = user._id.toString()

        //set data context
        await login(username, password)
    })

    describe('when user already exists, logged in and create a game', () => {
        
        it("should not return nothing", async() => {
            const game = await createGame(name, owner)
            expect(game).toBeUndefined()
        })
    })

    describe('unhappy paths', () => {
        
        it("should fail when id name not a string", async() => {
            name = 1
            try {
                await createGame(name, owner)
            } catch (error) {
                expect(error.message).toBe(`name ${name} is not a string`)
            }

            name = true
            try {
                await createGame(name, owner)
            } catch (error) {
                expect(error.message).toBe(`name ${name} is not a string`)
            }

            name = undefined
            try {
                await createGame(name, owner)
            } catch (error) {
                expect(error.message).toBe(`name ${name} is not a string`)
            }

            name = null
            try {
                await createGame(name, owner)
            } catch (error) {
                expect(error.message).toBe(`name ${name} is not a string`)
            }

            name = ''
            try {
                await createGame(name, owner)
            } catch (error) {
                expect(error.message).toBe('name is empty')
            }
        })

        it("should fail on id is not a string", async() => {
            name = 'game-test'
            owner =  1
            try {
                await createGame(id, owner)
            } catch (error) {
                expect(error.message).toBe(`owner ${owner} is not a string`)
            }

            owner = true
            try {
                await createGame(id, owner)
            } catch (error) {
                expect(error.message).toBe(`owner ${owner} is not a string`)
            }

            owner = undefined
            try {
                await createGame(id, owner)
            } catch (error) {
                expect(error.message).toBe(`owner ${owner} is not a string`)
            }

            owner = null
            try {
                await createGame(id, owner)
            } catch (error) {
                expect(error.message).toBe(`owner ${owner} is not a string`)
            }

            owner = ''
            try {
                await createGame(id, owner)
            } catch (error) {
                expect(error.message).toBe('owner is empty')
            }
        })
    })
    afterAll(async () => {
        await User.deleteMany()
        await Game.deleteMany()
        return await mongoose.disconnect()
    })
})