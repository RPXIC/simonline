require('dotenv').config()
require('simonline-utils/shuffle')()
const { models: { User, Game } } = require('simonline-data')
const { mongoose } = require('simonline-data')
const { env: { TEST_MONGODB_URL } } = process
const { expect } = require('chai')
const { random } = Math
const { wait } = require('simonline-utils')
const retrieveGameStatus = require('./retrieve-game-status')

/** At least --timeout 5000 */

describe('retrieveGameStatus', () => {
    before(() => mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => Promise.all([User.deleteMany(), Game.deleteMany()])))

    let owner, username, password, gameId, playerId, game2, gameId2, gameId3, userNotJoined
    let users = []
    let combination = Math.floor(random() * 4)
    const name = `name-${random()}`
    const cycles = 4
    const nameNotJoined = `name-${random()}`

    before(async() => {
        
        for (let i = 0; i < 4; i++) {
            username = `username-${random()}`
            password = `password-${random()}`
            const user = await User.create({ username, password })
            owner = user.id
            playerId = user.id.toString()
            users.push(user.id)
        }
    
        users.shuffle()
    
        const game = await Game.create({ name, owner })
        game.players = users
        gameId = game.id
        game.pushCombination.push(combination)
        game.turnStart = new Date()
        game.currentPlayer = users[0]
        game.status = "started"
        game.turnTimeout = 1
        await game.save()

        game2 = await Game.create({ name, owner })
        game2.players = users
        gameId2 = game2.id
        game2.pushCombination.push(combination)
        game2.turnStart = new Date()
        game2.currentPlayer = users[0]
        game2.status = "started"
        game2.turnTimeout = 1
        await game2.save()

        userNotJoined = await User.create({ username:nameNotJoined, password })

        const game3 = await Game.create({ name, owner })
        game3.players = users
        gameId3 = game3.id
        game3.pushCombination.push(combination)
        game3.turnStart = new Date()
        game3.currentPlayer = users[3]
        game3.status = "started"
        game3.turnTimeout = 1
        await game3.save()
    })

    describe('when users and game already exists, and first three players lose his turn', () => { 

        it('should succeed on valid first retrieved sanitized data with 4 players doing request at same time', async () => {

            for (let j = 0; j < cycles; j++) {
                Promise.all(users.map(user => {
                    (async() => {
                        const game = await retrieveGameStatus(user, gameId)
                        expect(game).to.be.an('object')
                        expect(game.name).to.be.an('string').to.equal(name)
                        expect(game.owner).to.be.an.instanceOf(Object)
                        expect(game.owner.toString()).to.be.an('string').to.equal(owner)
                        expect(game.status).to.be.an('string').to.equal('started')
                        expect(game.players).to.be.an('array').that.have.lengthOf(4)
                        expect(game.date).to.be.an.instanceOf(Date)
                        expect(game.pushCombination).to.be.an('array').that.have.lengthOf(1)
                        expect(game.watching).to.be.an('array').that.is.empty
                        expect(game.__v).not.to.exist
                        expect(game._id).not.to.exist
                    })()
                }))
            }
            await wait(1100)
        })
        

        it('should the first player are pushed to watching, and current player has changed before timeout', async () => {

            for (let j = 0; j < cycles; j++) {
                Promise.all(users.map(user => {
                    (async() => {
                        const game = await retrieveGameStatus(user, gameId)
                        expect(game.status).to.be.an('string').to.equal('started')
                        expect(game.players).to.be.an('array').that.have.lengthOf(4)
                        expect(game.date).to.be.an.instanceOf(Date)
                        expect(game.pushCombination).to.be.an('array').that.have.lengthOf(1)
                        expect(game.watching).to.be.an('array').that.have.lengthOf(1)
                        expect(game.watching[0].toString()).to.equal(users[0])
                        expect(game.combinationViewed).to.be.empty
                        expect(game.combinationViewed).to.be.an.instanceOf(Array)
                        expect(game.currentPlayer.toString()).to.equal(users[1])
                    })()
                }))
            }
            await wait(1100)
        })

        it('should the second player are pushed to watching, and current player has changed before timeout', async () => {

            for (let j = 0; j < cycles; j++) {
                Promise.all(users.map(user => {
                    (async() => {
                        const game = await retrieveGameStatus(user, gameId)
                        expect(game.status).to.be.an('string').to.equal('started')
                        expect(game.players).to.be.an('array').that.have.lengthOf(4)
                        expect(game.pushCombination).to.be.an('array').that.have.lengthOf(1)
                        expect(game.watching).to.be.an('array').that.have.lengthOf(2)
                        expect(game.watching[1].toString()).to.equal(users[1])
                        expect(game.currentPlayer.toString()).to.equal(users[2])
                    })()
                }))
            }
            await wait(1100)
        })

        it('should the third player are pushed to watching, fourth player are current player and has changed before timeout and win', async () => {
 
            const game = await retrieveGameStatus(playerId, gameId)
            expect(game.status).to.be.an('string').to.equal('finished')
            expect(game.players).to.be.an('array').that.have.lengthOf(4)
            expect(game.pushCombination).to.be.an('array').that.have.lengthOf(1)
            expect(game.watching).to.be.an('array').that.have.lengthOf(3)
            expect(game.watching[2].toString()).to.equal(users[2])
            expect(game.currentPlayer.toString()).to.equal(users[3])
            await wait(1100)
        })

        it('if there are more request after game finished, only return the last status', async () => {
 
            const game = await retrieveGameStatus(playerId, gameId)
            expect(game.status).to.be.an('string').to.equal('finished')
            expect(game.players).to.be.an('array').that.have.lengthOf(4)
            expect(game.pushCombination).to.be.an('array').that.have.lengthOf(1)
            expect(game.watching).to.be.an('array').that.have.lengthOf(3)
            expect(game.currentPlayer.toString()).to.equal(users[3])
            await wait(1100)
        })
    })

    describe('when users and game3 already exist and current player start and are the fourth of players list', () => {
        
        it('should chenge to first player, pushed to watching and game continue if lose his turn', async() => {

            const game3 = await retrieveGameStatus(playerId, gameId3)
            expect(game3.status).to.be.an('string').to.equal('started')
            expect(game3.players).to.be.an('array').that.have.lengthOf(4)
            expect(game3.pushCombination).to.be.an('array').that.have.lengthOf(1)
            expect(game3.watching).to.be.an('array').that.have.lengthOf(1)
            expect(game3.currentPlayer.toString()).to.equal(users[0])
        })
    })

    describe('unhappy paths', () => {

        it('should throw error if any player not joined and try to retrieve game status', async() => {
            try {
                await retrieveGameStatus(userNotJoined._id.toString(), gameId2)
            } catch (error) {
                expect(error.message).to.equal(`player ${userNotJoined._id.toString()}, not joined on game`)
            }
        })

        it('should fail on a non-string playerId', async() => {
            let fakePlayerId = 1

            try {
                await retrieveGameStatus(fakePlayerId, gameId)
            } catch (error) {
                expect(error.message).to.equal(`playerId ${fakePlayerId} is not a string`)
            }

            fakePlayerId = false

            try {
                await retrieveGameStatus(fakePlayerId, gameId)
            } catch (error) {
                expect(error.message).to.equal(`playerId ${fakePlayerId} is not a string`)
            }

            fakePlayerId = undefined

            try {
                await retrieveGameStatus(fakePlayerId, gameId)
            } catch (error) {
                expect(error.message).to.equal(`playerId ${fakePlayerId} is not a string`)
            }

            fakePlayerId = null

            try {
                await retrieveGameStatus(fakePlayerId, gameId)
            } catch (error) {
                expect(error.message).to.equal(`playerId ${fakePlayerId} is not a string`)
            }

            fakePlayerId = []

            try {
                await retrieveGameStatus(fakePlayerId, gameId)
            } catch (error) {
                expect(error.message).to.equal(`playerId ${fakePlayerId} is not a string`)
            }

            fakePlayerId = ''
            
            try {
                await retrieveGameStatus(fakePlayerId, gameId)
            } catch (error) {
                expect(error.message).to.equal('playerId is empty')
            }
        })

        it('should fail on a non-string gameId', async() => {
            let fakeGameId = 1

            try {
                await retrieveGameStatus(playerId, fakeGameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${fakeGameId} is not a string`)
            }

            fakeGameId = false

            try {
                await retrieveGameStatus(playerId, fakeGameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${fakeGameId} is not a string`)
            }

            fakeGameId = undefined

            try {
                await retrieveGameStatus(playerId, fakeGameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${fakeGameId} is not a string`)
            }

            fakeGameId = null

            try {
                await retrieveGameStatus(playerId, fakeGameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${fakeGameId} is not a string`)
            }

            fakeGameId = []

            try {
                await retrieveGameStatus(playerId, fakeGameId)
            } catch (error) {
                expect(error.message).to.equal(`gameId ${fakeGameId} is not a string`)
            }

            fakeGameId = ''

            try {
                await retrieveGameStatus(playerId, fakeGameId)
            } catch (error) {
                expect(error.message).to.equal('gameId is empty')
            }
        })
    })
    after(() => Promise.all([User.deleteMany(), Game.deleteMany()]).then(() => mongoose.disconnect()))
})