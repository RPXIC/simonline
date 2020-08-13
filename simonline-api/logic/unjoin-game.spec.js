require('dotenv').config()
const { env: { TEST_MONGODB_URL } } = process
const { models: { User, Game }, mongoose } = require('simonline-data')
const { expect } = require('chai')
const { random } = Math
require('../../simonline-utils/shuffle')()
const unjoinGame = require('./unjoin-game')

describe('unjoin game', () => {
    before(() => mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => Promise.all([User.deleteMany(), Game.deleteMany()])))

    let username, password, name, owner, id, gameId, notOwnerId
    let users = []

    before(() => {
        username = `username-${random()}`
        password = `password-${random()}`
        name = `name-${random()}`
    })

    before(async() => {
        for (let i = 0; i < 10; i++) {
            const user = await User.create({ username, password })
            id = user._id.toString()
            owner = user._id
            users.push(user.id)
        }

        const game = await Game.create({ name, owner })
        gameId = game._id.toString()
        game.players = users
        game.save()
    })

    describe('when 10 players and game already created', () => {

        it('should not found when owner try unjoin his game', async () => {
           const tryUnjoinGame = await unjoinGame(id, gameId)
           expect(tryUnjoinGame.players).that.have.lengthOf(10)
        })

        it('should delete player id from players game', async () => {
            notOwnerId = users[1]
            const unjoinedGame = await unjoinGame(notOwnerId, gameId)
            expect(unjoinedGame.players).that.have.lengthOf(9)
        })

        it('should not found when player try unjoin started game', async () => {
            const game = await Game.findById(gameId)
            game.status = 'started'
            await game.save()

            try {
                await unjoinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal(`game ${name} already start`)
            }
        })

        it('should not found when player try unjoin finished game', async () => {
            const game = await Game.findById(gameId)
            game.status = 'finished'
            await game.save()

            try {
                await unjoinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal(`game ${name} already finished`)
            }
        })
    })

    describe('unhappy paths', () => {

        it('should fail on a non-string id', async() => {
            id = 1

            try {
                await unjoinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal(`id ${id} is not a string`)
            }

            id = false

            try {
                await unjoinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal(`id ${id} is not a string`)
            }
            
            id = undefined

            try {
                await unjoinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal(`id ${id} is not a string`)
            }

            id = null

            try {
                await unjoinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal(`id ${id} is not a string`)
            }
            
            id = []

            try {
                await unjoinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal(`id ${id} is not a string`)
            }

            id = ''

            try {
                await unjoinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal('id is empty')
            }
        })
            
        it('should fail on a non-string gameId', async() => {
            id = notOwnerId
            gameId = 1

            try {
                await unjoinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${gameId} is not a string`)
            }

            gameId = false

            try {
                await unjoinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${gameId} is not a string`)
            }
            
            gameId = undefined

            try {
                await unjoinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${gameId} is not a string`)
            }

            gameId = null

            try {
                await unjoinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${gameId} is not a string`)
            }
            
            gameId = []

            try {
                await unjoinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${gameId} is not a string`)
            }

            gameId = ''

            try {
                await unjoinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal('gameId is empty')
            }
        })
    })
    after(() => Promise.all([User.deleteMany(), Game.deleteMany()]).then(() => mongoose.disconnect()))
})
