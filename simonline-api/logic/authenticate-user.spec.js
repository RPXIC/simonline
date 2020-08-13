require('dotenv').config()
const { env: { TEST_MONGODB_URL } } = process
const { mongoose, models: { User, Game } } = require('simonline-data')
const { expect } = require('chai')
const { random } = Math
const authenticateUser = require('./authenticate-user')
const bcrypt = require('bcryptjs')

describe('authenticateUser', () => {
    before(() => mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => Promise.all([User.deleteMany(), Game.deleteMany()])))

    let username = `username-${random()}`
    let password = `password-${random()}`
    let _id

    before( async() => {
        const cryptedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({ username, password:cryptedPassword })
        return _id = user.id
    })

    describe('when user already exists', () => {
        
        it('should succeed on correct and valid credentials', async() => {
            const user = await authenticateUser(username, password)
            expect(user.id.toString()).to.equal(_id.toString())
            expect(user.username).to.equal(username)
            const dbUser = await User.findOne({username})
            const match = await bcrypt.compare(password, dbUser.password)
            expect(match).to.be.true
        })

        it('should response are sanitized', async() => {
            const user = await authenticateUser(username, password)
            expect(user.__v).not.to.exist
            expect(user._id).not.to.exist
            expect(user.password).not.to.exist
        })

        it('should fail on incorrect username', async() => {
            try {
                await authenticateUser(`${username}-wrong`, password)
            } catch (error) {
                expect(error.message).to.equal('Wrong credentials')
            }
        })

        it('should fail on incorrect password', async() => {
            try {
                await authenticateUser(username, `${password}-wrong`)
            } catch (error) {
                expect(error.message).to.equal('Wrong credentials')
            }
        })
    })

    describe('unhappy paths', () => {
        
        it('should fail on non-string username', async() => {
            let wrongUsername = 1

            try {
                await authenticateUser(wrongUsername, password)
            } catch (error) {
                expect(error.message).to.equal(`username ${wrongUsername} is not a string`)
            }

            wrongUsername = true
            
            try {
                await authenticateUser(wrongUsername, password)
            } catch (error) {
                expect(error.message).to.equal(`username ${wrongUsername} is not a string`)
            }
    
            wrongUsername = undefined

            try {
                await authenticateUser(wrongUsername, password)
            } catch (error) {
                expect(error.message).to.equal(`username ${wrongUsername} is not a string`)
            }

            wrongUsername = []

            try {
                await authenticateUser(wrongUsername, password)
            } catch (error) {
                expect(error.message).to.equal(`username ${wrongUsername} is not a string`)
            }

            wrongUsername = null

            try {
                await authenticateUser(wrongUsername, password)
            } catch (error) {
                expect(error.message).to.equal(`username ${wrongUsername} is not a string`)
            }

            wrongUsername = ''

            try {
                await authenticateUser(wrongUsername, password)
            } catch (error) {
                expect(error.message).to.equal('username is empty')
            }
        })

        it('should fail on non-string password', async() => {
            username = 'username-test'
            let wrongPassword = 1

            try {
                await authenticateUser(username, wrongPassword)
            } catch (error) {
                expect(error.message).to.equal(`password ${wrongPassword} is not a string`)
            }
    
            wrongPassword = true

            try {
                await authenticateUser(username, wrongPassword)
            } catch (error) {
                expect(error.message).to.equal(`password ${wrongPassword} is not a string`)
            }

            wrongPassword = undefined

            try {
                await authenticateUser(username, wrongPassword)
            } catch (error) {
                expect(error.message).to.equal(`password ${wrongPassword} is not a string`)
            }

            wrongPassword = []

            try {
                await authenticateUser(username, wrongPassword)
            } catch (error) {
                expect(error.message).to.equal(`password ${wrongPassword} is not a string`)
            }

            wrongPassword = ''

            try {
                await authenticateUser(username, wrongPassword)
            } catch (error) {
                expect(error.message).to.equal('password is empty')
            }       
        })
    })
    after(() => Promise.all([User.deleteMany(), Game.deleteMany()]).then(() => mongoose.disconnect()))
})
