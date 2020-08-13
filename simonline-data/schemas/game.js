const { Schema, Types: { ObjectId } } = require('mongoose')

module.exports = new Schema({
    name: { type: String, required: true },
    players: [{ type: ObjectId, ref: 'User', required: true}],
    watching: [{ type: ObjectId, ref: 'User' }],
    currentPlayer: { type: ObjectId, ref: 'User' },
    pushCombination: [{type: Number}],
    combinationViewed: [{ type: ObjectId, ref: 'User' }],
    owner: { type: ObjectId, required: true, ref: 'User'},
    status: { type: String, required: true, default: "waiting"},
    date: { type: Date, required: true, default: new Date() },
    turnStart: { type: Date },
    turnTimeout: { type: Number }
})