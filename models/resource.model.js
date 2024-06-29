const mongoose = require('mongoose')

const ResourceSchema = new mongoose.Schema(
{
    UserID: {type: String, required: true},
    Type: {type: String, required: true, unique: true},
    Location: {type: String, required: true},
    Description: {type: String, required: true},
    Start: {type: Date, required: true},
    End: {type: Date, required: true}
}, {collection: 'Resources'})

module.exports = mongoose.model('Resource', ResourceSchema)