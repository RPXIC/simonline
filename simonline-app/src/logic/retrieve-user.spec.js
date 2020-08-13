const { env: { REACT_APP_TEST_MONGODB_URL: TEST_MONGODB_URL } } = process
const { mongoose, models: { User } } = require('simonline-data')
const { random } = Math
const { login, retrieveUser, logout } = require('.')
const bcrypt = require('bcryptjs')

describe('retrieve-user-from-token', () => {
    
    beforeAll(async () => {
        await mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        return await User.deleteMany()
    })
    
    let username, password, token
    
    beforeAll(() => {
        username = `username-${random()}`
        password = `password-${random()}`
    })
    
    beforeAll(async () => {
        const cryptedPassword = await bcrypt.hash(password, 10)
        await User.create({ username, password:cryptedPassword })
        const userAuth = await login(username, password)
        token = userAuth.token
    })

    describe('when user already exists', () => {
        
        it('should get username from token decoded', async() => {
            const userRetrieved = await retrieveUser(token)
            expect(userRetrieved).toBe(username)
        })

        it("should fail when user are not loged", async() => {
            try {
                await logout()
                await retrieveUser()
            } catch (error) {
                expect(error.message).toBe('jwt malformed')
            }
        })
    })

    describe('unhappy paths', () => {

        it('should fail on non-string token',  async() => {

            try {
                token = 1
                await retrieveUser(token)
            } catch(error) {
                expect(error.message).toBe('jwt malformed')
            }

            try {
                token = true
                await retrieveUser(token)
            } catch(error) {
                expect(error.message).toBe('jwt malformed')
            }

            try {
                token = undefined
                await retrieveUser(token)
            } catch(error) {
                expect(error.message).toBe('jwt malformed')
            }

            try {
                token = null
                await retrieveUser(token)
            } catch(error) {
                expect(error.message).toBe('jwt malformed')
            }

            try {
                token = []
                await retrieveUser(token)
            } catch(error) {
                expect(error.message).toBe('jwt must be provided')
            }
            
            try {
                token = ''
                await retrieveUser(token)
            } catch(error) {
                expect(error.message).toBe('jwt malformed')
            }
        })
    })
    afterAll(async () => {
        await User.deleteMany()
        return await mongoose.disconnect()
    })
})