require('dotenv').config()
const { env: { TEST_MONGODB_URL } } = process
const { mongoose, models: { User, Game } } = require('simonline-data')
const { expect } = require('chai')
const { random } = Math
const deleteGame = require('./delete-game')

describe('delete-game', () => {
    before(() => mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => Promise.all([User.deleteMany(), Game.deleteMany()])))

    let gameId, owner, username, password, name, userId

    before(() => {
        username = `username-${random()}`
        password = `password-${random()}`
        name = `name-${random()}`
    })

    before(async() => {
        const newUser = await User.create({ username, password })
        userId = newUser.id
        owner = newUser.id 
    })

    before(async() => {
        const newGame = await Game.create({name, owner})
        gameId = newGame.id
    })

    describe('when game and user already exists', () => {

        it('should succeed on correct created user', async() => {
            const user = await User.findById(userId)
            expect(user).to.exist
            expect(user._id.toString()).to.equal(userId)
            expect(user.username).to.equal(username)
        })

        it('should succeed on correct created game', async() => {
            const game = await Game.findById(gameId)
            expect(game).to.exist
            expect(game).to.be.an.instanceOf(Object)
            expect(game._id).to.exist
            expect(game.players).to.be.an('array').that.is.empty
            expect(game.watching).to.be.an('array').that.is.empty
            expect(game.pushCombination).to.be.an('array').that.is.empty
            expect(game.combinationViewed).to.be.an('array').that.is.empty
            expect(game.status).to.equal('waiting')
            expect(game.date).to.be.an.instanceOf(Date)
            expect(game.name).to.equal(name)
            expect(game.owner.toString()).to.equal(owner)
        })

        it('should succeed on deleted game', async() => {
            const deletedGame = await deleteGame(gameId)
            expect(deletedGame).to.be.undefined

            const findDeletedGame = await Game.findById(gameId)
            expect(findDeletedGame).to.be.null
        })
    })

    describe('when game already deleted', () => {

        it('should fail delete a deleted game', async() => {
            try {
                await deleteGame(gameId)
            } catch (error) {
                expect(error.message).to.equal(`game with id ${gameId} does not exist`)
            }
        })
    })

    describe('unhappy paths', () => {
        
        it('should fail on a non-string game id', async() => {
            let gameId = 1

            try {
                await deleteGame(gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${gameId} is not a string`)
            }

            gameId = false

            try {
                await deleteGame(gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${gameId} is not a string`)
            }
        
            gameId = undefined

            try {
                await deleteGame(gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${gameId} is not a string`)
            }

            gameId = null

            try {
                await deleteGame(gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${gameId} is not a string`)
            }
    
            gameId = []

            try {
                await deleteGame(gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${gameId} is not a string`)
            }

            gameId = ''

            try {
                await deleteGame(gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId is empty`)
            }   
        })
    })
    after(() => Promise.all([User.deleteMany(), Game.deleteMany()]).then(() => mongoose.disconnect()))
})