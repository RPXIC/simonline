const { Schema } = require('mongoose')

module.exports = new Schema({
    username: { type: String, required: true, ref: 'Game' },
    password: { type: String, required: true }
})