const { env: { REACT_APP_TEST_MONGODB_URL: TEST_MONGODB_URL } } = process
const { mongoose, models: { User, Game } } = require('simonline-data')
const { random } = Math
const { login, retrieveGameStatus, logout } = require('.')
const bcrypt = require('bcryptjs')

describe('retrieve-game-status', () => {
    
    beforeAll(async () => {
        await mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        await Game.deleteMany()
        return await User.deleteMany()
    })
    
    let username, password, id, user, gameId, owner, user2
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
        user2 = await User.create({ username, password:cryptedPassword })
    })

    describe('when game already exists', () => {
        
        it("should retrieve game status game when player do a request", async() => {
            const game = await retrieveGameStatus(gameId)
            expect.objectContaining(game)
            expect(game.pushCombination).toHaveLength(1)
            expect(game.currentPlayer).toBe(id)
        })

        it("should fail when player not joined on this game", async() => {
            await login(username, password)

            try {
                await retrieveGameStatus(gameId)
            } catch (error) {
                expect(error.message).toBe(`player ${user2.id}, not joined on game`)
            }

        })

        it("should fail when user are not loged", async() => {
            try {
                await logout()
                await retrieveGameStatus(gameId)
            } catch (error) {
                expect(error.message).toBe('jwt malformed')
            }
        })
    })
    afterAll(async () => {
        await User.deleteMany()
        await Game.deleteMany()
        return await mongoose.disconnect()
    })
})