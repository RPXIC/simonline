const mongoose = require('mongoose')
const { game } = require('../schemas')

module.exports = mongoose.model('Game', game)