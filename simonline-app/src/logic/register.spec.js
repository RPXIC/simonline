const TEST_MONGODB_URL = process.env.REACT_APP_TEST_MONGODB_URL
const { mongoose, models: { User } } = require('simonline-data')
const { register } = require('.')
const bcrypt = require('bcryptjs')

describe('registerUser', () => {

    beforeAll(async () => {
        await mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        return await User.deleteMany()
    })

    let username, password

    beforeAll(() => {
        username = 'username-' + Math.random()
        password = 'password-' + Math.random()
    })

    describe('when user name and password already exist', () => {

        it('should succeed saved on db when new user register, and register nothing returns', async () => {
            const result = await register(username, password)
            expect(result).toBeUndefined()

            const user = await User.findOne({ username })
            const validPassword = await bcrypt.compare(password, user.password)

            expect.objectContaining(user)
            expect(user._id).toBeDefined()
            expect(user.username).toBe(username)
            expect(user.password).not.toBe(password)
            expect(validPassword).toBeTruthy()
        })

        it('should fail on already existing user', async () => {
            try{
                await register(username, password)
            }catch(error){
                expect(error).toStrictEqual(Error(`User with username ${username} already exists`))
            }
        })
    })

    describe('unhappy paths', () => {

        it('should fail on non-string username', async () => {
            
            try{
                username = 1
                await register(username, password)
            }catch(error){
                expect(error).toEqual(TypeError(`username ${username} is not a string`))
            }

            try{
                username = true
                await register(username, password)
            }catch(error){
                expect(error).toEqual(TypeError(`username ${username} is not a string`))
            }

            try{
                username = undefined
                await register(username, password)
            }catch(error){
                expect(error).toEqual(TypeError(`username ${username} is not a string`))
            }

            try{
                username = []
                await register(username, password)
            }catch(error){
                expect(error).toEqual(TypeError(`username ${username} is not a string`))
            }

            try{
                username = null
                await register(username, password)
            }catch(error){
                expect(error).toEqual(TypeError(`username ${username} is not a string`))
            }

            try{
                username = ''
                await register(username, password)
            }catch(error){
                expect(error).toEqual(TypeError('username is empty'))
            }
        })

        it('should fail on non-string password', async () => {

            try {
                username = 'username'
                password = 1
                await register(username, password)
            } catch (error) {
                expect(error).toEqual(TypeError(`password ${password} is not a string`))
            }

            try {
                password = true
                await register(username, password)
            } catch (error) {
                expect(error).toEqual(TypeError(`password ${password} is not a string`))
            }

            try {
                password = undefined
                await register(username, password)
            } catch (error) {
                expect(error).toEqual(TypeError(`password ${password} is not a string`))
            }

            try {
                password = []
                await register(username, password)
            } catch (error) {
                expect(error).toEqual(TypeError(`password ${password} is not a string`))
            }

            try {
                password = null
                await register(username, password)
            } catch (error) {
                expect(error).toEqual(TypeError(`password ${password} is not a string`))
            }

            try {
                password = ''
                await register(username, password)
            } catch (error) {
                expect(error).toEqual(TypeError('password is empty'))
            }
        })
    })
    afterAll(async () => {
        await User.deleteMany()
        return await mongoose.disconnect()
    })
})