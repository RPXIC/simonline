require('dotenv').config()
const { env: { TEST_MONGODB_URL } } = process
const { expect } = require('chai')
const { random } = Math
const retrieveGames = require('./retrieve-games')
const { mongoose, models: { Game, User } } = require('simonline-data')

describe('retrieve-games', () => {
    before(() => mongoose.connect(TEST_MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => Promise.all([User.deleteMany(), Game.deleteMany()])))

    let name, owner, id, gameId
    
    before(() => {
        name = `name-${random()}`
        username = `username-${random()}`
        password = `password-${random()}`
    })

    before(async() => {
        const user = await User.create({username, password})
        id = user._id.toString()
        owner = user._id.toString()
        await user.save()

        const game = await Game.create({name, owner})
        gameId = game._id.toString()
    })

    describe('when game already exists', () => {
        
        it('should succeed on correct retrieved sanitized data', async() => {
            const game = await retrieveGames()
            expect(game[0].id).to.equal(gameId)
            expect(game[0].name).to.equal(name)
            expect(game[0].status).to.equal("waiting")
            expect(game[0].owner.toString()).to.equal(owner)
            expect(game[0]._id).not.to.exist
            expect(game[0].__v).not.to.exist
        })
        
        it('should not return any games if her status is not waiting', async() => {
            await Game.deleteMany()
            const game = await retrieveGames()
            expect(game).to.be.an('array').that.is.empty
        })
    })
    after(() => Promise.all([User.deleteMany(), Game.deleteMany()]).then(() => mongoose.disconnect()))
})