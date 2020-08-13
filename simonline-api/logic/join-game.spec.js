require('dotenv').config()
const { env: { TEST_MONGODB_URL } } = process
const { mongoose, models: { User, Game } } = require('simonline-data')
const { expect } = require('chai')
const { random } = Math
const joinGame = require('./join-game')

describe('join-game', () => {
    before(() => mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => Promise.all([User.deleteMany(), Game.deleteMany()])))

    let username, password, name, owner, id, gameId

    before(() => {
        username = `username-${random()}`
        password = `password-${random()}`
        name = `name-${random()}`
    })

    before(async() => {
        const user = await User.create({username, password})
        id = user._id.toString()
        owner = user._id.toString()

        const game = await Game.create({name, owner})
        gameId = game._id.toString()
    })

    describe('when user and game already exists', () => {

        it('should succeed on correct and valid data and player joined', async () => {
            const join = await joinGame(id, gameId)
            expect(join.players).to.be.an('array').that.includes(id)
            
            const [user, game] = await Promise.all([User.findById(id),Game.findById(gameId)])
            expect(user).to.exist
            expect(game).to.exist
            expect(game.name).to.equal(name)
            expect(game.players).to.be.an('array').that.includes(id)
            expect(game.owner.toString()).to.equal(owner)
        })

        it('should not rejoin the same player', async () => {
            const join = await joinGame(id, gameId)
            expect(join.players).to.be.an('array').that.includes(id)
            expect(join.players).to.have.lengthOf(1)
        })

        it('should not join when the game status are started', async () => {
            const game = await Game.findById(gameId)
            game.status = 'started'
            await game.save()

            try {
                await joinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal(`game ${name} already started`)
            }            
        })
    })

    describe('unhappy paths', () => {

        it('should fail on a non-string user id', async() => {
            let id = 1

            try {
                await joinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal(`id ${id} is not a string`)
            }

            id = false

            try {
                await joinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal(`id ${id} is not a string`)
            }

            id = undefined

            try {
                await joinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal(`id ${id} is not a string`)
            }

            id = null

            try {
                await joinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal(`id ${id} is not a string`)
            }
            
            id = []

            try {
                await joinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal(`id ${id} is not a string`)
            }
            
            id = ''
            
            try {
                await joinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal('id is empty')
            }
        })

        it('should fail on a non-string game id', async() => {
            let gameId = 1

            try {
                await joinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${gameId} is not a string`)
            }

            gameId = false

            try {
                await joinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${gameId} is not a string`)
            }

            gameId = undefined

            try {
                await joinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${gameId} is not a string`)
            }

            gameId = undefined

            try {
                await joinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${gameId} is not a string`)
            }
            
            gameId = []

            try {
                await joinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${gameId} is not a string`)
            }
            
            gameId = ''
        
            try {
                await joinGame(id, gameId)
            } catch (error) {
                expect(error.message).to.equal('gameId is empty')
            }
        })
    })
    after(() => Promise.all([User.deleteMany(), Game.deleteMany()]).then(() => mongoose.disconnect()))
})