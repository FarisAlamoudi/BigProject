const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema(
{
    FirstName: {type: String, required: true,},
    LastName: {type: String, required: true},
    UserName: {type: String, required: true, unique: true},
    Password: {type: String, required: true, validate:
    {
        validator: function(v) {return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\-]{5,}$/.test(v)},
        message: props => `${props.value} is not a valid password. Password must be at least 5 characters long and contain at least one letter and one number.`
    }},
    Email: {type: String, required: true, unique: true, validate:
    {
        validator: function(v) {return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v)},
        message: props => `${props.value} is not a valid email address Format: name@example.com.`
    }},
    Phone: {type: String, required: true, unique: true, validate:
    {
        validator: function(v) {return /^\d{10}$/.test(v)},
        message: props => `${props.value} is not a valid phone number. Format: 1234567890`
    }},
    IsAdmin: {type: Boolean, default: false},
    EmailVerified: {type: Boolean, default: false},
    DarkMode: {type: Boolean, default: false},
    PublicInfo: {type: Boolean, default: false},
    VerificationToken: {type: String}
}, {collection: 'Users'})

UserSchema.pre('save', async function(next)
{
    if (!this.isModified('Password'))
        return next()
    try 
    {
        const hashedPassword = await bcrypt.hash(this.Password, 10)
        this.Password = hashedPassword
        return next()
    } 
    catch (error) 
    {
        return next(error)
    }
})

module.exports = mongoose.model('User', UserSchema)