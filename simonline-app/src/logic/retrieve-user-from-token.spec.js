const { env: { REACT_APP_TEST_MONGODB_URL: TEST_MONGODB_URL } } = process
const { mongoose, models: { User } } = require('simonline-data')
const { random } = Math
const { login, retrieveUserFromToken } = require('.')
const bcrypt = require('bcryptjs')

describe('retrieve-user-from-token', () => {
    
    beforeAll(async () => {
        await mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        return await User.deleteMany()
    })
    
    let username, password, id, user, token
    
    beforeAll(() => {
        username = `username-${random()}`
        password = `password-${random()}`
    })
    
    beforeAll(async () => {
        const cryptedPassword = await bcrypt.hash(password, 10)
        user = await User.create({ username, password:cryptedPassword })
        id = user._id.toString()
        const userAuth = await login(username, password)
        token = userAuth.token
    })

    describe('when user already exists', () => {
        
        it('should get id and username from token decoded', () => {
            const userRetrieved = retrieveUserFromToken(token)
            expect(userRetrieved.id).toBe(id)
            expect(userRetrieved.username).toBe(username)
        })

        it('should fail on invalid characters token', () => {
            try {
                retrieveUserFromToken('fake.token.fake')
            } catch(error) {
                expect(error.message).toBe('The string to be decoded contains invalid characters.')
            }
        })
    })

    describe('unhappy paths', () => {

        it('should fail on incomplete token', () => {
            const [/*header*/, payload, signature] = token.split('.')
            const incompleteToken = payload.concat(signature)

            try {
                retrieveUserFromToken(incompleteToken)
            } catch(error) {
                expect(error.message).toBe('invalid token')
            }

            try {
                token = '..'
                retrieveUserFromToken(token)
            } catch(error) {
                expect(error.message).toBe('invalid token')
            }
        })

        it('should fail on non-string token',  () => {

            try {
                token = 1
                retrieveUserFromToken(token)
            } catch(error) {
                expect(error.message).toBe(`token ${token} is not a string`)
            }

            try {
                token = true
                retrieveUserFromToken(token)
            } catch(error) {
                expect(error.message).toBe(`token ${token} is not a string`)
            }

            try {
                token = undefined
                retrieveUserFromToken(token)
            } catch(error) {
                expect(error.message).toBe(`token ${token} is not a string`)
            }

            try {
                token = null
                retrieveUserFromToken(token)
            } catch(error) {
                expect(error.message).toBe(`token ${token} is not a string`)
            }

            try {
                token = []
                retrieveUserFromToken(token)
            } catch(error) {
                expect(error.message).toBe(`token ${token} is not a string`)
            }
            
            try {
                token = ''
                retrieveUserFromToken(token)
            } catch(error) {
                expect(error.message).toBe('token is empty')
            }
        })
    })
    afterAll(async () => {
        await User.deleteMany()
        return await mongoose.disconnect()
    })
})