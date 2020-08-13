const { env: { REACT_APP_TEST_MONGODB_URL: TEST_MONGODB_URL } } = process
const { mongoose, models: { User } } = require('simonline-data')
const { random } = Math
const { login, context } = require('.')
const bcrypt = require('bcryptjs')


describe('login-user', () => {
    
    beforeAll(async () => {
        await mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        return await User.deleteMany()
    })
    
    let username, password, id, user
    
    beforeAll(() => {
        username = `username-${random()}`
        password = `password-${random()}`
    })
    
    beforeAll(async () => {
        const cryptedPassword = await bcrypt.hash(password, 10)
        user = await User.create({ username, password:cryptedPassword })
        return id = user._id.toString()
    })

    describe('when user already exists', () => {
        
        it('should succeed on correct credentials, setted on context and res are sanitized', async () => {

            const userData = await login(username, password)

            expect(userData.id).toBe(id)
            expect(userData.username).toBe(username)
            expect.stringContaining(userData.token)
            expect(userData.token.length).not.toBe(0)
            expect(userData.password).toBeUndefined()

            expect.objectContaining(context.user)
            expect(context.user.id).toBe(id)
            expect(context.user.username).toBe(username)
            expect(context.user.token).toBeDefined()

            expect(userData.__v).toBeUndefined()
            expect(userData._id).toBeUndefined()
        })

        it('should fail on incorrect password', async () => {

            try {
                await login(username, `${password}-wrong`)
            } catch(error) {
                expect(error.message).toBe(`Wrong credentials`)
            }
        })

        it('should fail when user does not exist', async () => {

            try {
                await login(`wrong-${username}`, password)
            } catch(error) {
                expect(error.message).toEqual(`Wrong credentials`)
            }
        })

        it('should fail on non-string username', async () => {
            
            username = 1
            try{
                await login(username, password)
            }catch(error){
                expect(error).toEqual(TypeError(`username ${username} is not a string`))
            }

            username = true
            try{
                await login(username, password)
            }catch(error){
                expect(error).toEqual(TypeError(`username ${username} is not a string`))
            }

            username = []
            try{
                await login(username, password)
            }catch(error){
                expect(error).toEqual(TypeError(`username ${username} is not a string`))
            }

            username = undefined
            try{
                await login(username, password)
            }catch(error){
                expect(error).toEqual(TypeError(`username ${username} is not a string`))
            }

            username = null
            try{
                await login(username, password)
            }catch(error){
                expect(error).toEqual(TypeError(`username ${username} is not a string`))
            }

            username = ''
            try{
                await login(username, password)
            }catch(error){
                expect(error).toEqual(TypeError('username is empty'))
            }
        })

        it('should fail on non-string password', async () => {

            username = 'username'
            password = 1
            try {
                await login(username, password)
            } catch (error) {
                expect(error).toEqual(TypeError(`password ${password} is not a string`))
            }

            password = true
            try {
                await login(username, password)
            } catch (error) {
                expect(error).toEqual(TypeError(`password ${password} is not a string`))
            }

            password = undefined
            try {
                await login(username, password)
            } catch (error) {
                expect(error).toEqual(TypeError(`password ${password} is not a string`))
            }

            password = null
            try {
                await login(username, password)
            } catch (error) {
                expect(error).toEqual(TypeError(`password ${password} is not a string`))
            }

            password = []
            try {
                await login(username, password)
            } catch (error) {
                expect(error).toEqual(TypeError(`password ${password} is not a string`))
            }

            password = ''
            try {
                await login(username, password)
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