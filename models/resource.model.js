const mongoose = require('mongoose')

const ResourceSchema = new mongoose.Schema(
{
    Name: {type: String, required: true, unique: true},
    Location: {type: String, required: true},
    Description: {type: String, required: true},
}, {collection: 'Resources'})

module.exports = mongoose.model('Resource', ResourceSchema)