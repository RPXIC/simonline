require('dotenv').config()
const { env: { TEST_MONGODB_URL } } = process
const { mongoose, models: { User, Game } } = require('simonline-data')
const { expect } = require('chai')
const { random } = Math
const registerUser = require('./register-user')
const bcrypt = require('bcryptjs')

describe('registerUser', () => {
    before(() => mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => Promise.all([User.deleteMany(), Game.deleteMany()])))
    
    let username = `username-${random()}`
    let password = `password-${random()}`

    it('should not return data and error when user registered successfully', async() => {
        const res = await registerUser(username, password)
        expect(res).not.to.exist
        expect(res).to.be.undefined
    })

    it('should saved user successfully with crypted password', async() => {
        const user = await User.findOne({ username })
        expect(user.username).to.equal(username)
        expect(user.password).not.equal(password)
        const match = await bcrypt.compare(password, user.password)
        expect(match).to.be.true
    })

    it('should fail on already username exist', async() => {
        try {
            await registerUser(username, password)
        } catch (error) {
            expect(error.message).to.equal(`User with username ${username} already exists`)
        }
    })

    describe('unhappy paths', () => {

        it('should fail register on invalid username', async() => {

            username = 1

            try {
                await registerUser(username, password)
            } catch (error) {
                expect(error.message).to.equal(`username ${username} is not a string`)
            }

            username = ''

            try {
                await registerUser(username, password)
            } catch (error) {
                expect(error.message).to.equal('username is empty')
            }

            username = false

            try {
                await registerUser(username, password)
            } catch (error) {
                expect(error.message).to.equal(`username ${username} is not a string`)
            }

            username = undefined

            try {
                await registerUser(username, password)
            } catch (error) {
                expect(error.message).to.equal(`username ${username} is not a string`)
            }

            username = null

            try {
                await registerUser(username, password)
            } catch (error) {
                expect(error.message).to.equal(`username ${username} is not a string`)
            }

            username = []

            try {
                await registerUser(username, password)
            } catch (error) {
                expect(error.message).to.equal(`username ${username} is not a string`)
            }
        })

        it('should fail register on invalid password', async() => {

            username = 'username'
            password = 1

            try {
                await registerUser(username, password)
            } catch (error) {
                expect(error.message).to.equal(`password ${password} is not a string`)
            }

            password = false

            try {
                await registerUser(username, password)
            } catch (error) {
                expect(error.message).to.equal(`password ${password} is not a string`)
            }

            password = undefined

            try {
                await registerUser(username, password)
            } catch (error) {
                expect(error.message).to.equal(`password ${password} is not a string`)
            }

            password = null

            try {
                await registerUser(username, password)
            } catch (error) {
                expect(error.message).to.equal(`password ${password} is not a string`)
            }

            password = ''

            try {
                await registerUser(username, password)
            } catch (error) {
                expect(error.message).to.equal('password is empty')
            }
        })
    })
    after(() => Promise.all([User.deleteMany(), Game.deleteMany()]).then(() => mongoose.disconnect()))
})