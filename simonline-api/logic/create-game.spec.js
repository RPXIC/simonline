require('dotenv').config()
const { env: { TEST_MONGODB_URL } } = process
const { models: { User, Game } } = require('simonline-data')
const { expect } = require('chai')
const { random } = Math
const createGame = require('./create-game')
const { mongoose } = require('simonline-data')

describe('createGame', () => {
    before(() => mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => Promise.all([User.deleteMany(), Game.deleteMany()])))

    let name, username, password, owner, id

    before(() => {
        name = `name-${random()}`
        username = `username-${random()}`
        password = `password-${random()}`
    })

    before(async() => {
        const user = await User.create({ username, password })
        id = user.id
        owner = user.id
    })

    describe('when user already exists', () => {

        it('should not return nothing when game are successfully created', async() => {
            const res = await createGame(name, owner)
            expect(res).to.be.undefined
        })

        it('shoul game are successfully saved on db', async() => {
            const game = await Game.findOne({ name, owner })
            expect(game).to.exist
            expect(game).to.be.an.instanceOf(Object)
            expect(game._id).to.exist
            expect(game.players).to.be.an('array').that.includes(id)
            expect(game.players).to.have.lengthOf(1)
            expect(game.watching).to.be.an('array').that.is.empty
            expect(game.pushCombination).to.be.an('array').that.is.empty
            expect(game.combinationViewed).to.be.an('array').that.is.empty
            expect(game.status).to.equal('waiting')
            expect(game.date).to.be.an.instanceOf(Date)
            expect(game.name).to.equal(name)
            expect(game.owner.toString()).to.equal(owner)
        })
    })

    describe('unhappy paths', () => {

        it('should fail on a non-string name', async() => {
            let name = 1

            try {
                await createGame(name, owner)
            } catch (error) {
                expect(error.message).to.equal(`name ${name} is not a string`)
            }

            name = false

            try {
                await createGame(name, owner)
            } catch (error) {
                expect(error.message).to.equal(`name ${name} is not a string`)
            }

            name = undefined

            try {
                await createGame(name, owner)
            } catch (error) {
                expect(error.message).to.equal(`name ${name} is not a string`)
            }

            name = null

            try {
                await createGame(name, owner)
            } catch (error) {
                expect(error.message).to.equal(`name ${name} is not a string`)
            }

            name = []

            try {
                await createGame(name, owner)
            } catch (error) {
                expect(error.message).to.equal(`name ${name} is not a string`)
            }

            name = ''

            try {
                await createGame(name, owner)
            } catch (error) {
                expect(error.message).to.equal('name is empty')
            }
        })

        it('should fail on a non-string owner', async() => {
            let owner = 1

            try {
                await createGame(name, owner)
            } catch (error) {
                expect(error.message).to.equal(`owner ${owner} is not a string`)
            }
            owner = false

            try {
                await createGame(name, owner)
            } catch (error) {
                expect(error.message).to.equal(`owner ${owner} is not a string`)
            }

            owner = undefined

            try {
                await createGame(name, owner)
            } catch (error) {
                expect(error.message).to.equal(`owner ${owner} is not a string`)
            }

            owner = null

            try {
                await createGame(name, owner)
            } catch (error) {
                expect(error.message).to.equal(`owner ${owner} is not a string`)
            }

            owner = []

            try {
                await createGame(name, owner)
            } catch (error) {
                expect(error.message).to.equal(`owner ${owner} is not a string`)
            }

            owner = ''

            try {
                await createGame(name, owner)
            } catch (error) {
                expect(error.message).to.equal('owner is empty')
            }
        })
    })
    after(() => Promise.all([User.deleteMany(), Game.deleteMany()]).then(() => mongoose.disconnect()))
})