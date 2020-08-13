require('dotenv').config()
const { env: { TEST_MONGODB_URL } } = process
const { expect } = require('chai')
const { random } = Math
const retrieveUser = require('./retrieve-user')
const { mongoose, models: { User, Game } } = require('simonline-data')

describe('retrieveUser', () => {
    before(() => mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => Promise.all([User.deleteMany(), Game.deleteMany()])))

    let username, password, id

    before(() => {
        username = `username-${random()}`
        password = `password-${random()}`
    })

    beforeEach(async() => {
        const user = await User.create({ username, password })
        id = user._id.toString()
    })

    describe('when username already exists', () => {

        it('should succeed on correct and valid data', async() => {
            const userRetrieved = await retrieveUser(id)
            console.log(userRetrieved)
            expect(userRetrieved).to.be.a('string').that.equal(username)
        })
    })

    describe('when username already exists', () => {

        it('should fail on a non-string gameId', async() => {
            let id = 1
            
            try {
                await retrieveUser(id)
            } catch (error) {
                expect(error.message).to.equal(`id ${id} is not a string`)
            }

            id = false

            try {
                await retrieveUser(id)
            } catch (error) {
                expect(error.message).to.equal(`id ${id} is not a string`)
            }
    
            id = undefined

            try {
                await retrieveUser(id)
            } catch (error) {
                expect(error.message).to.equal(`id ${id} is not a string`)
            }

            id = null

            try {
                await retrieveUser(id)
            } catch (error) {
                expect(error.message).to.equal(`id ${id} is not a string`)
            }

            id = []

            try {
                await retrieveUser(id)
            } catch (error) {
                expect(error.message).to.equal(`id ${id} is not a string`)
            }

            id = ''

            try {
                await retrieveUser(id)
            } catch (error) {
                expect(error.message).to.equal('id is empty')
            }
        })
    })
    after(() => Promise.all([User.deleteMany(), Game.deleteMany()]).then(() => mongoose.disconnect()))
})