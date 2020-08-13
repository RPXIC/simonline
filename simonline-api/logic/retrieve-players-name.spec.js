require('dotenv').config()
const { env: { TEST_MONGODB_URL } } = process
const { models: { User, Game } } = require('simonline-data')
const { expect } = require('chai')
const { random } = Math
require('../../simonline-utils/shuffle')()
const retrievePlayersName = require('./retrieve-players-name')
const { mongoose } = require('simonline-data')

describe('retrieveGameStatus', () => {
    before(() => mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => Promise.all([User.deleteMany(), Game.deleteMany()])))

    let username, password, name, owner, gameId, player1
    let combination = Math.floor(random() * 4)
    let users = []

    before(() => {
        username = `username-${random()}`
        password = `password-${random()}`
        name = `name-${random()}`
    })

    before(async() => {
        for (let i = 0; i < 10; i++) {
            const user = await User.create({ username, password })
            owner = user._id
            users.push(user.id)
        }

        const game = await Game.create({ name, owner })
        gameId = game._id.toString()
        game.players = users
        game.players.shuffle()
        game.pushCombination.push(combination)
        game.turnStart = new Date()
        game.currentPlayer = game.players[0]
        game.status = "started"
        game.turnTimeout = 1
        player1 = game.currentPlayer
        game.save()
    })

    describe('when 10 players and game already created', () => {

        it('should succeed on valid first retrieved data', async () => {
            const players = await retrievePlayersName(gameId)
            expect(players).to.be.an('array').that.have.lengthOf(10)
            expect(players[0]).to.be.an('object').that.have.all.keys('id', 'username')
        })
    })

    describe('unhappy paths', () => {

        it('should fail on a non-string gameId', async() => {
            gameId = 1

            try {
                await retrievePlayersName(gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${gameId} is not a string`)
            }

            gameId = false

            try {
                await retrievePlayersName(gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${gameId} is not a string`)
            }
            
            gameId = undefined

            try {
                await retrievePlayersName(gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${gameId} is not a string`)
            }

            gameId = null

            try {
                await retrievePlayersName(gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${gameId} is not a string`)
            }
            
            gameId = []

            try {
                await retrievePlayersName(gameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${gameId} is not a string`)
            }

            gameId = ''

            try {
                await retrievePlayersName(gameId)
            } catch (error) {
                expect(error.message).to.equal('gameId is empty')
            }
        })
    })
    after(() => Promise.all([User.deleteMany(), Game.deleteMany()]).then(() => mongoose.disconnect()))
})

