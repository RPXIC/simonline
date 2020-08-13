const { env: { REACT_APP_TEST_MONGODB_URL: TEST_MONGODB_URL } } = process
const { mongoose, models: { User, Game } } = require('simonline-data')
const { random } = Math
const { login, retrieveGames, logout } = require('.')
const bcrypt = require('bcryptjs')

describe('retrieve-games', () => {
    
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

        //game2
        const game2 = await Game.create({ name, owner })
        gameId2 = game2.id
        game2.pushCombination.push(combination)
        game2.turnStart = new Date()
        game2.status = "waiting"
        game2.turnTimeout = 20
        await game2.save()
    })

    describe('when game already exists', () => {
        
        it("should return array of objects with games in waiting status", async() => {
            const games = await retrieveGames()
            expect.arrayContaining(games)
            expect(games).toHaveLength(2)
            expect.objectContaining(games[0])
            expect(games[0]).toHaveProperty('id')
        })

        it("should fail when user are not loged", async() => {
            try {
                await logout()
                await retrieveGames()
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