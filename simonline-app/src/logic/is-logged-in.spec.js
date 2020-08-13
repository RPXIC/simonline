const { env: { REACT_APP_TEST_MONGODB_URL: TEST_MONGODB_URL } } = process
const { mongoose, models: { User, Game } } = require('simonline-data')
const { random } = Math
const { login, isLoggedIn } = require('.')
const bcrypt = require('bcryptjs')

describe('is-logged-in', () => {
    
    beforeAll(async () => {
        await mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        await Game.deleteMany()
        return await User.deleteMany()
    })
    
    let username, password, id, user

    beforeAll(async () => {
        //user
        username = `username-${random()}`
        password = `password-${random()}`
        const cryptedPassword = await bcrypt.hash(password, 10)
        user = await User.create({ username, password:cryptedPassword })
        id = user._id.toString()

    })
    
    describe('when user already exists', () => {
        
        it("should return false when user is not logged in", async() => {
            expect(isLoggedIn()).toBeFalsy()
            await login(username, password)
        })
        
        it("should return true when user is logged in", () => {
            expect(isLoggedIn()).toBeTruthy()
        })
    })

    afterAll(async () => {
        await User.deleteMany()
        await Game.deleteMany()
        return await mongoose.disconnect()
    })
})