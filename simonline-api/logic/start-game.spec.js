require('dotenv').config()
const { env: { TEST_MONGODB_URL } } = process
const { models: { User, Game }, mongoose } = require('simonline-data')
const { expect } = require('chai')
const { random } = Math
const startGame = require('./start-game')
require('../../simonline-utils/shuffle')()

describe('startGame', () => {
    before(() => mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => Promise.all([User.deleteMany(), Game.deleteMany()])))

    let name, owner, username, password, gameId, id, notOwnerId
    let users = []

    before(() => {
        username = `username-${random()}`
        password = `password-${random()}`
        name = `name-${random()}`
    })

    before(async() => {
        for (let i = 0; i < 10; i++) {
            const user = await User.create({ username, password })
            users.push(user.id)
        }
        id = users[0]
        owner = users[0]

        const game = await Game.create({ name, owner })
        gameId = game._id.toString()
        game.players = users
        notOwnerId = users[1]
        game.save()
    })

    describe('when user and game already exists', () => {

        it('should succeed and no return data on start game', async() => {
            try {
                await startGame(notOwnerId, gameId)
            } catch (error) {
                expect(error.message).to.equal(`only the owner ${owner} can start game`)
            }
        })

        it('should succeed and return game on start game', async() => {
            const start = await startGame(owner, gameId)
            expect(start).to.exist
        })

        it('should succeed change status after start game', async() => {            
            const game = await Game.findOne({ name, owner })
    
            expect(game).to.exist
            expect(game.name).to.equal(name)
            expect(game.status).to.equal("started")
            expect(game.players.length).to.equal(10)
            expect(game.date).to.exist
            expect(game.pushCombination.length).to.equal(1)
            expect(game.watching).to.be.empty
            expect(game.combinationViewed).to.be.empty
        })

        it('should fail start game a started game', async() => {            
            try {
                await startGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal(`game with id ${gameId} is started`)
            }
        })
    })
     
    describe('unhappy paths', () => {

        it('should fail on a non-string playerId', async() => {
            let playerId = 1

            try {
                await startGame(playerId, gameId)
            } catch (error) {
                expect(error.message).to.equal(`playerId ${playerId} is not a string`)
            }

            playerId = false

            try {
                await startGame(playerId, gameId)
            } catch (error) {
                expect(error.message).to.equal(`playerId ${playerId} is not a string`)
            }

            playerId = undefined

            try {
                await startGame(playerId, gameId)
            } catch (error) {
                expect(error.message).to.equal(`playerId ${playerId} is not a string`)
            }

            playerId = null

            try {
                await startGame(playerId, gameId)
            } catch (error) {
                expect(error.message).to.equal(`playerId ${playerId} is not a string`)
            }

            playerId = []

            try {
                await startGame(playerId, gameId)
            } catch (error) {
                expect(error.message).to.equal(`playerId ${playerId} is not a string`)
            }

            playerId = ''

            try {
                await startGame(playerId, gameId)
            } catch (error) {
                expect(error.message).to.equal('playerId is empty')
            }
        })

        it('should fail on a non-string gameId', async() => {
            playerId = id
            let gameId = 1

            try {
                await startGame(playerId, gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${gameId} is not a string`)
            }

            gameId = false

            try {
                await startGame(playerId, gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${gameId} is not a string`)
            }

            gameId = undefined

            try {
                await startGame(playerId, gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${gameId} is not a string`)
            }

            gameId = null

            try {
                await startGame(playerId, gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${gameId} is not a string`)
            }

            gameId = []

            try {
                await startGame(playerId, gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${gameId} is not a string`)
            }

            gameId = ''

            try {
                await startGame(playerId, gameId)
            } catch (error) {
                expect(error.message).to.equal('gameId is empty')
            }
        })
    })
    after(() => Promise.all([User.deleteMany(), Game.deleteMany()]).then(() => mongoose.disconnect()))
})