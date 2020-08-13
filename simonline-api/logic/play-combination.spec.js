require('dotenv').config()
require('../../simonline-utils/shuffle')()
const { env: { TEST_MONGODB_URL } } = process
const { models: { User, Game } } = require('simonline-data')
const { mongoose } = require('simonline-data')
const { expect } = require('chai')
const { random } = Math
const playCombination = require('./play-combination')

describe('play combination', () => {
    before(() => mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
        .then(() => Promise.all([User.deleteMany(), Game.deleteMany()])))

    let name, owner, username, password, gameId, playersOrder, gameId2, gameId3, previousPlayer, previousDate, gameIdOutTime
    let combinationPlayer = [2]
    let users = []
    let combination = 2
    const indexCurrentPlayer = player => playersOrder.indexOf(player)

    before(() => {
        username = `username-${random()}`
        password = `password-${random()}`
        name = `name-${random()}`
    })

    before(async() => {
        for (let i = 0; i < 10; i++) {
            const user = await User.create({ username, password })
            owner = user.id
            playerId = user.id
            users.push(user.id)
        }

        const game = await Game.create({ name, owner })
        gameId = game.id
        game.players = users
        game.players.shuffle()
        playersOrder = game.players
        game.pushCombination.push(combination)
        game.turnStart = new Date()
        previousDate = game.turnStart
        game.currentPlayer = game.players[0]
        game.status = "started"
        game.turnTimeout = 23
        firstPlayer = game.currentPlayer.toString()
        previousPlayer = game.currentPlayer.toString()
        game.save()

        const gameOutTime = await Game.create({ name, owner })
        gameOutTime.players = users
        gameOutTime.players.shuffle()
        gameIdOutTime = gameOutTime.id
        gameOutTime.pushCombination.push(combination)
        gameOutTime.turnStart = new Date()
        gameOutTime.currentPlayer = gameOutTime.players[0]
        gameOutTime.status = "started"
        gameOutTime.turnTimeout = -1
        gameOutTime.save()

        const game2 = await Game.create({ name, owner })
        gameId2 = game2.id
        game2.players = playersOrder
        game2.pushCombination.push(combination)
        game2.turnStart = new Date()
        game2.currentPlayer = game2.players[0]
        game2.status = "started"
        game2.turnTimeout = 23
        game2.save()

        const game3 = await Game.create({ name, owner })
        gameId3 = game3.id
        game3.players = playersOrder
        game3.pushCombination.push(combination)
        game3.turnStart = new Date()
        game3.currentPlayer = game3.players[0]
        game3.status = "started"
        game3.turnTimeout = 23
        game3.save()
    })

    describe('when 10 players and game already exists, and first player match and win in first round, when the next 9 players fail', () => {

        it('If by chance, any player arrive to send a combination out of time, does nothing', async () => {
            const game = await playCombination(gameIdOutTime, combinationPlayer)
            expect(game.pushCombination).to.be.an('array').that.have.lengthOf(1)
            expect(game.watching).to.be.an('array').that.is.empty
        })
        
        it('when first player match the combination, change to next player, push new combination, time has be reset, game continue and response are sanitized', async () => {
            const game = await playCombination(gameId, combinationPlayer)
            expect(game).to.be.an('object')
            expect(game.players).to.be.an('array').that.have.lengthOf(10)
            expect(game.pushCombination).to.be.an('array').that.have.lengthOf(2)
            expect(game.watching).to.be.an('array').that.is.empty
            expect(game.turnStart > previousDate).to.be.true
            expect(game.status).to.equal('started')
            expect(game.currentPlayer).to.not.equal(previousPlayer)
            expect(game.currentPlayer.toString()).to.equal(game.players[indexCurrentPlayer(previousPlayer)+1].toString())
            expect(game.__v).not.to.exist
            expect(game._id).not.to.exist
            previousPlayer = game.currentPlayer
        })
        
        it('when second player fail the combination, player has moved to watching, change to next player, non pushed a new combination, time has be reset and game continue', async () => {
            
            combinationPlayer = [1, 2]

            const game = await playCombination(gameId, combinationPlayer)
            expect(game).to.exist
            expect(game.players).to.be.an('array').that.have.lengthOf(10)
            expect(game.pushCombination).to.be.an('array').that.have.lengthOf(2)
            expect(game.watching).to.be.an('array').that.have.lengthOf(1)
            expect(game.turnStart > previousDate).to.be.true
            expect(game.status).to.equal('started')
            expect(game.currentPlayer).to.not.equal(previousPlayer)
            expect(game.currentPlayer.toString()).to.equal(game.players[indexCurrentPlayer(previousPlayer)+1].toString())
        })

        it('when the next eight players fail the combination, first player win, he is the current player, non pushed a new combination these turns, time has be reset and game finished', async () => {
            
            combinationPlayer = [1, 2]
            let game

            for (var i = 0; i < 8; i++) {
                game = await playCombination(gameId, combinationPlayer)
            }
            expect(game).to.exist
            expect(game.players).to.be.an('array').that.have.lengthOf(10)
            expect(game.pushCombination).to.be.an('array').that.have.lengthOf(2)
            expect(game.watching).to.be.an('array').that.have.lengthOf(9)
            expect(game.turnStart > previousDate).to.be.true
            expect(game.status).to.equal('finished')
            expect(game.currentPlayer).to.not.equal(previousPlayer)
            expect(game.currentPlayer.toString()).to.equal(firstPlayer)
        })
    })

    describe('when 10 players and game2 already exists, first and second player match on first round, next players fail, and first player fail second round', () => {
        let game2

        it('when first and secon player match', async() => {
            combinationPlayer = [2]

            for (var i = 0; i < 2; i++) {
                game2 = await playCombination(gameId2, combinationPlayer)
                combinationPlayer = game2.pushCombination
            }
            expect(game2.watching).to.be.an('array').that.have.lengthOf(0)
            expect(game2.pushCombination).to.be.an('array').that.have.lengthOf(3)
        })
        
        it('when next players fail and first player fail on second round', async() => {
            combinationPlayer = [0]
    
            for (var i = 0; i < 9; i++) {
                game2 = await playCombination(gameId2, combinationPlayer)
            }
    
            expect(game2.watching).to.be.an('array').that.have.lengthOf(9)
            expect(game2.pushCombination).to.be.an('array').that.have.lengthOf(3)
            expect(game2.status).to.equal('finished')
            expect(game2.currentPlayer.toString()).to.equal(game2.players[1].toString())
        })
    })
    
    describe('when 10 players and game3 already exists, first and last player match on first round, other next players fail, and first player fail second round', () => {
        let game3

        it('when first player match', async() => {
            combinationPlayer = [2]

            game3 = await playCombination(gameId3, combinationPlayer)
            expect(game3.watching).to.be.an('array').that.have.lengthOf(0)
            expect(game3.pushCombination).to.be.an('array').that.have.lengthOf(2)
            expect(game3.currentPlayer.toString()).to.equal(game3.players[1].toString())
        })
        
        it('when eight next players fail', async() => {
            combinationPlayer = [0]

            for (var i = 0; i < 8; i++) {
                game3 = await playCombination(gameId3, combinationPlayer)
            }
            expect(game3.watching).to.be.an('array').that.have.lengthOf(8)
            expect(game3.pushCombination).to.be.an('array').that.have.lengthOf(2)
            expect(game3.currentPlayer.toString()).to.equal(game3.players[game3.players.length-1].toString())

            combinationPlayer = game3.pushCombination
        })

        it('when last player match', async() => {

            game3 = await playCombination(gameId3, combinationPlayer)

            expect(game3.watching).to.be.an('array').that.have.lengthOf(8)
            expect(game3.pushCombination).to.be.an('array').that.have.lengthOf(3)
            expect(game3.currentPlayer.toString()).to.equal(game3.players[0].toString())

            combinationPlayer = [0]
        })
        
        it('when first player fail on second round, and last player win', async() => {

            game3 = await playCombination(gameId3, combinationPlayer)

            expect(game3.watching).to.be.an('array').that.have.lengthOf(9)
            expect(game3.pushCombination).to.be.an('array').that.have.lengthOf(3)
            expect(game3.currentPlayer.toString()).to.equal(game3.players[game3.players.length-1].toString())
            expect(game3.status).to.equal('finished')
        })
    })

    describe('unhappy paths', () => {

        it('should fail on a non-string gameId', async() => {
            let fakeGameId = 1

            try {
                await playCombination(fakeGameId, combinationPlayer)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${fakeGameId} is not a string`)
            }

            fakeGameId = false

            try {
                await playCombination(fakeGameId, combinationPlayer)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${fakeGameId} is not a string`)
            }

            fakeGameId = undefined

            try {
                await playCombination(fakeGameId, combinationPlayer)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${fakeGameId} is not a string`)
            }

            fakeGameId = null

            try {
                await playCombination(fakeGameId, combinationPlayer)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${fakeGameId} is not a string`)
            }

            fakeGameId = []

            try {
                await playCombination(fakeGameId, combinationPlayer)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${fakeGameId} is not a string`)
            }

            fakeGameId = ''

            try {
                await playCombination(fakeGameId, combinationPlayer)
            } catch (error) {
                expect(error.message).to.equal('gameId is empty')
            }

        })

        it('should fail on a non-object combinationPlayer', async() => {
            let fakeCombinationPlayer = 1

            try {
                await playCombination(gameId, fakeCombinationPlayer)
            } catch (error) {
                expect(error.message).to.equal(`combination ${fakeCombinationPlayer} is not a object`)
            }

            fakeCombinationPlayer = false

            try {
                await playCombination(gameId, fakeCombinationPlayer)
            } catch (error) {
                expect(error.message).to.equal(`combination ${fakeCombinationPlayer} is not a object`)
            }

            fakeCombinationPlayer = undefined

            try {
                await playCombination(gameId, fakeCombinationPlayer)
            } catch (error) {
                expect(error.message).to.equal(`combination ${fakeCombinationPlayer} is not a object`)
            }

            fakeCombinationPlayer = 'a'

            try {
                await playCombination(gameId, fakeCombinationPlayer)
            } catch (error) {
                expect(error.message).to.equal(`combination ${fakeCombinationPlayer} is not a object`)
            }

            fakeCombinationPlayer = ''

            try {
                await playCombination(gameId, fakeCombinationPlayer)
            } catch (error) {
                expect(error.message).to.equal(`combination ${fakeCombinationPlayer} is not a object`)
            }
        })
    })
    after(() => Promise.all([User.deleteMany(), Game.deleteMany()]).then(() => mongoose.disconnect()))
})