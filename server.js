const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Resource = require('./models/resource.model');
const Reservation = require('./models/reservation.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {sendVerification, sendReset} = require('./emailService');
const path = require('path');


const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

require('dotenv').config()

const connectWithRetry = () =>
{
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => {console.log('Connected to MongoDB')})
    .catch((error) =>
    {
        console.error('Error connecting to MongoDB:', error.message)
        setTimeout(connectWithRetry, 5000)
    })
}

connectWithRetry()

function errorHandler(error, res)
{
    if (error.errors && typeof error.errors === 'object')
    {
        let errors = {}
        Object.keys(error.errors).forEach((key) => {errors[key] = error.errors[key].message})
        return res.status(400).send({errors})
    }
    else
        return res.status(400).send({error: error.message})
}

/*  API Endpoints:

    FUNCTIONAL:

    Users: Register | Verify Email | Reset Password | Login
    Resources: Add | Edit | Delete | Show
    Reservations: Add | Edit | Delete | Show

    --------------------------------------

    TODO:

    Edit user / settings: (dark mode, public vs private info on reservations, etc)

*/

// incoming: FirstName, LastName, UserName, Password, Email, Phone
// outgoing: success || error
app.post('/api/register', async(req, res) =>
{
    try
    {
        const newUser = await User.create(
        {
            FirstName: req.body.FirstName, LastName: req.body.LastName,
            UserName: req.body.UserName, Password: req.body.Password, Email: req.body.Email,
            Phone: req.body.Phone, VerificationToken: Math.random().toString(36) + Date.now().toString(36)
        })
        sendVerification(newUser.Email,newUser.VerificationToken)
        return res.status(201).send({success: 'User registered, verify email address to login.'})
    }
    catch (error)
    {
        return errorHandler(error, res)
    }
})

// incoming: VerificationToken
// outgoing: success || error
app.post('/api/verifyemail', async(req, res) =>
{
    const user = await User.findOne({VerificationToken: req.body.VerificationToken})
    if (!user)
        return res.status(404).send({error: 'Verification token not found.'})
    if (!user.EmailVerified)
        await user.save(user.EmailVerified = true)
    else
        return res.status(400).send({error: 'Email already verified.'})
    return res.status(200).send({success: 'Email verified.'})
})

// incoming: Email
// outgoing: RESET_TOKEN || error
app.post('/api/sendresettoken', async(req, res) =>
{
    const user = await User.findOne({Email: req.body.Email})
    if (!user)
        return res.status(401).send({error: 'Email does not belong to a 4331booking account.'})
    const resetToken = Math.random().toString(36).substring(2,8)
    sendReset(user.Email, resetToken)
    return res.status(200).send({RESET_TOKEN: resetToken})
})

// incoming: Email, NewPassword
// outgoing: success || error
app.post('/api/updatepassword', async(req, res) =>
{
    const user = await User.findOne({Email: req.body.Email})
    if (!user)
        return res.status(401).send({error: 'Email does not belong to a 4331booking account.'})
    try
    {
        await user.save(user.Password = req.body.NewPassword)
        return res.status(200).send({success: 'Password updated.'})
    }
    catch (error)
    {
        return errorHandler(error, res)
    }
})

// incoming: UserName, Password
// outgoing: JWT || error
app.post('/api/login', async(req, res) =>
{
    const user = await User.findOne({UserName: req.body.UserName})
    if (!user || !(await bcrypt.compare(req.body.Password, user.Password)))
        return res.status(401).send({error: 'Login/Password incorrect.'})
    if (user.EmailVerified)
    {
        const token = jwt.sign(
        {
            _id: user._id, FirstName: user.FirstName, LastName: user.LastName, UserName: user.UserName,
            Email: user.Email, Phone: user.Phone, IsAdmin: user.IsAdmin, EmailVerified: user.EmailVerified,
            DarkMode: user.DarkMode, PublicInfo: user.PublicInfo, VerificationToken: user.VerificationToken
        }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'})
        return res.status(200).send({JWT: token})
    }
    else
        return res.status(401).send({error: 'Must verify email address to login.'})
})

// edit user

// incoming: JWT, Type, Location, Description, Start, End
// outgoing: NEW_RESOURCE || error
app.post('/api/addresource', async(req, res) =>
{
    try
    {
        const user = jwt.verify(req.headers.authorization.split(' ')[1], process.env.ACCESS_TOKEN_SECRET)
        try
        {
            const newResource = await Resource.create(
            {
                UserID: user._id, Type: req.body.Type, Location: req.body.Location,
                Description: req.body.Description, Start: new Date(req.body.Start), End: new Date(req.body.End)
            })
            return res.status(201).send({NEW_RESOURCE: newResource})
        }
        catch (error)
        {
            return errorHandler(error, res)
        }
    }
    catch (error)
    {
        return res.status(401).send({error: error.message})
    }
})

// incoming: JWT, ResourceID, Type, Location, Description, Start, End
// outgoing: UPDATED_RESOURCE || error
app.post('/api/editresource', async(req, res) =>
{
    try
    {
        const user = jwt.verify(req.headers.authorization.split(' ')[1], process.env.ACCESS_TOKEN_SECRET)
        const editResource = await Resource.findOne({_id: req.body.ResourceID})
        if (!editResource)
            return res.status(404).send({error: 'Resource not found.'})
        if (!user.IsAdmin && editResource.UserID !== user._id)
            return res.status(403).send({error: 'Unauthorized access to edit this resource.'})
        editResource.Type = req.body.Type
        editResource.Location = req.body.Location
        editResource.Description = req.body.Description
        editResource.Start = req.body.Start
        editResource.End = req.body.End
        try
        {
            await editResource.save({})
            return res.status(200).send({UPDATED_RESOURCE: editResource})
        }
        catch (error)
        {
            return errorHandler(error, res)
        }
    }
    catch (error)
    {
        return res.status(401).send({error: error.message})
    }
})

// incoming: JWT, ResourceID
// outgoing: DELETED_RESOURCE || error
app.post('/api/deleteresource', async(req, res) =>
{
    try
    {
        const user = jwt.verify(req.headers.authorization.split(' ')[1], process.env.ACCESS_TOKEN_SECRET)
        const deleteResource = await Resource.findOne({_id: req.body.ResourceID})
        if (!deleteResource)
            return res.status(404).send({error: 'Resource not found.'})
        if (!user.IsAdmin && deleteResource.UserID !== user._id)
            return res.status(403).send({error: 'Unauthorized access to delete this resource.'})
        try
        {
            await Resource.findOneAndDelete({_id: deleteResource._id})
            return res.status(200).send({DELETED_RESOURCE: deleteResource})
        }
        catch (error)
        {
            return errorHandler(error, res)
        }
    }
    catch (error)
    {
        return res.status(401).send({error: error.message})
    }
})

// incoming: Search
// outgoing: RESOURCES || error
app.post('/api/showresources', async(req, res) =>
{
    const {Query} = req.body
    let filter = {}
    if (Query)
    {
        const fields = ['Type','Location','Description']
        filter = {$or: fields.map(field => ({[field]: {$regex: new RegExp(Query,'i')}}))}
    }
    try
    {
        let resources
        if (Object.keys(filter).length === 0)
            resources = await Resource.find().exec()
        else
            resources = await Resource.find(filter).exec()
        return res.status(200).send({RESOURCES: resources})
    }
    catch (error)
    {
        return res.status(500).send({error: error.message})
    }
})

// incoming: JWT, ResourceID, Comment, Start, End
// outgoing: NEW_RESERVATION || error
app.post('/api/addreservation', async(req, res) =>
{
    try
    {
        const user = jwt.verify(req.headers.authorization.split(' ')[1], process.env.ACCESS_TOKEN_SECRET)
        try
        {
            const newReservation = await Reservation.create(
            {
                UserID: user._id, ResourceID: req.body.ResourceID, Comment: req.body.Comment,
                Start: new Date(req.body.Start), End: new Date(req.body.End)
            })
            return res.status(201).send({NEW_RESERVATION: newReservation})
        }
        catch (error)
        {
            return errorHandler(error, res)
        }
    }
    catch (error)
    {
        return res.status(401).send({error: error.message})
    }
})

// incoming: JWT, ReservationID, Comment, Start, End
// outgoing: UPDATED_RESERVATION || error
app.post('/api/editreservation', async(req, res) =>
{
    try
    {
        const user = jwt.verify(req.headers.authorization.split(' ')[1], process.env.ACCESS_TOKEN_SECRET)
        const editReservation = await Reservation.findOne({_id: req.body.ReservationID})
        if (!editReservation)
            return res.status(404).send({error: 'Reservation not found.'})
        if (!user.IsAdmin && editReservation.UserID !== user._id)
            return res.status(403).send({error: 'Unauthorized access to edit this reservation.'})
        editReservation.Comment = req.body.Comment
        editReservation.Start = req.body.Start
        editReservation.End = req.body.End
        try
        {
            await editReservation.save({})
            return res.status(200).send({UPDATED_RESERVATION: editReservation})
        }
        catch (error)
        {
            return errorHandler(error, res)
        }
    }
    catch (error)
    {
        return res.status(401).send({error: error.message})
    }
})

// incoming: JWT, ReservationID
// outgoing: DELETED_RESERVATION || error
app.post('/api/deletereservation', async(req, res) =>
{
    try
    {
        const user = jwt.verify(req.headers.authorization.split(' ')[1], process.env.ACCESS_TOKEN_SECRET)
        const deleteReservation = await Reservation.findOne({_id: req.body.ReservationID})
        if (!deleteReservation)
            return res.status(404).send({error: 'Reservation not found.'})
        if (!user.IsAdmin && deleteReservation.UserID !== user._id)
            return res.status(403).send({error: 'Unauthorized access to delete this reservation.'})
        try
        {
            await Reservation.findOneAndDelete({_id: deleteReservation._id})
            return res.status(200).send({DELETED_RESERVATION: deleteReservation})
        }
        catch (error)
        {
            return errorHandler(error, res)
        }
    }
    catch (error)
    {
        return res.status(401).send({error: error.message})
    }
})

// incoming: Search
// outgoing: RESERVATIONS || error
app.post('/api/showreservations', async(req, res) =>
{
    const {Query} = req.body
    let filter = {}
    if (Query)
    {
        const fields = ['Comment']
        filter = {$or: fields.map(field => ({[field]: {$regex: new RegExp(Query,'i')}}))}
    }
    try
    {
        let reservations
        if (Object.keys(filter).length === 0)
            reservations = await Reservation.find().exec()
        else
            reservations = await Reservation.find(filter).exec()
        return res.status(200).send({RESERVATIONS: reservations})
    }
    catch (error)
    {
        return res.status(500).send({error: error.message})
    }
})

if (process.env.NODE_ENV === 'production');
{
    app.use(express.static('frontend/build'));
    app.get('*',(req,res) =>
    {
        res.sendFile(path.resolve(__dirname,'frontend','build','index.html'))
    });
}

app.listen(PORT,() =>
{
    console.log('Server listening on port ' + PORT)
})