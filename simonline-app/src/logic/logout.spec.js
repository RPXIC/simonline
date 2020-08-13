const { env: { REACT_APP_TEST_MONGODB_URL: TEST_MONGODB_URL } } = process
const { mongoose, models: { User, Game } } = require('simonline-data')
const { random } = Math
const { login, logout, context } = require('.')
const bcrypt = require('bcryptjs')

describe('logout', () => {
    
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

        //set data context
        await login(username, password)
    })

    describe('when user already exists and loged', () => {
        
        it("should has setted id, username and token", () => {
            expect.objectContaining(context.user)
            expect(context.user.id).toBe(id)
            expect(context.user.username).toBe(username)
            expect(context.user.token).toBeDefined()
        })

        it("should be deleted from context when user logout and be redirected to root", () => {
            logout()

            expect.not.objectContaining(context.user)
            expect(context.user.id).toBeUndefined()
            expect(context.user.username).toBeUndefined()
            expect(context.user.token).toBeUndefined()
        })
    })

    afterAll(async () => {
        await User.deleteMany()
        await Game.deleteMany()
        return await mongoose.disconnect()
    })
})