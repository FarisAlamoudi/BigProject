require('express');
const bcrypt = require('bcrypt');
// const sendOTP = require('./sendOTP');
const {ObjectId} = require('mongodb');
const {body,validationResult} = require('express-validator');
const {generateAccessToken,verifyAccessToken,refreshAccessToken} = require('./JWT');

/*  API Endpoints:

    FUNCTIONAL:

    Users: Register | Login
    Resources: Add | Edit | Delete
    Reservations: Add | Edit | Delete

    --------------------------------------

    TODO:

    Register: verify email or phone number and choose 2FA method (must be verified)
    Login: 2FA

*/

const authenticateToken = (req,res,next) =>
{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) 
    {
        return res.status(401).json({error:'Unauthorized: Missing token.'});
    }
    try
    {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    }
    catch(e)
    {
        console.error('Error verifying access token:',e);
        res.status(401).json({error:'Unauthorized: Invalid token.'});
    }
};

const handleValidationErrors = (req,res,next) =>
{
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        return res.status(400).json({errors:errors.array()});
    }
    next();
};

const refreshToken = async(req,res,next) =>
{
    try
    {
        await next();
        if (res.statusCode >= 200 && res.statusCode < 300 && req.user)
        {
            const authHeader = req.headers['authorization'];
            if (authHeader)
            {
                const token = authHeader.split(' ')[1];
                const refreshedToken = refreshAccessToken(token);
                if (refreshToken)
                {
                    return res.setHeader('authorization',`Bearer ${refreshedToken.accessToken}`);
                }
                console.error('Failed to refresh access token.');
            }
        }
    }
    catch(e)
    {
        console.error('Error in refreshToken:',e);
        next(e);
    }
}

exports.setApp = function(app,client)
{
    try
    {
        const db = client.db('Scheduler');

        // incoming: FirstName, LastName, Login, Password, Email, Phone
        // outgoing: NEW_USER, TOKEN || error
        app.post('/api/register',[
            body('FirstName').notEmpty().withMessage('First name is required'),
            body('LastName').notEmpty().withMessage('Last name is required'),
            body('Login').notEmpty().withMessage('Login is required'),
            body('Password').notEmpty().withMessage('Password is required').matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\-]).{7,}$/).withMessage('Invalid password'),
            body('Email').notEmpty().withMessage('Email address is required').isEmail().withMessage('Invalid email address'),
            body('Phone').notEmpty().withMessage('Phone number is required').matches(/^\d{3}-\d{3}-\d{4}$/).withMessage('Invalid phone number'),
        ],handleValidationErrors,async(req,res) =>
        {
            const {FirstName,LastName,Login,Password,Email,Phone} = req.body;

            const existingUser = await db.collection('Users').findOne({Login});
            if (existingUser)
            {
                return res.status(409).json({error:'Username already exists.'});
            }

            const hashedPassword = await bcrypt.hash(Password, 10);

            // generate verificaiton code 

            // save verification code to database

            // send verification email/text

            const insertedUser = await db.collection('Users').insertOne(
            {
                FirstName,LastName,Login,Password:hashedPassword,Email,Phone,
                IsAdmin:false,EmailVerified:false,PhoneVerified:false,Method2FA:false
            });

            const newUser = await db.collection('Users').findOne({_id:insertedUser.insertedId});
            const jwt = generateAccessToken(newUser);
            res.status(201).json({NEW_USER:newUser,TOKEN:jwt});
        });

        // incoming: Login, Password
        // outgoing: USER, TOKEN || error
        app.post('/api/login',[
            body('Login').notEmpty().withMessage('Login is required'),
            body('Password').notEmpty().withMessage('Password is required'),
        ],handleValidationErrors,async(req,res) =>
        {
            const {Login,Password} = req.body;

            const user = await db.collection('Users').findOne({Login});
            if (!user)
            {
                return res.status(401).json({error:'Login/Password incorrect.'});
            }

            const passwordMatch = await bcrypt.compare(Password, user.Password);
            if (!passwordMatch)
            {
                return res.status(401).json({error:'Login/Password incorrect.'});
            }

            if (user.EmailVerified || user.PhoneVerified)
            {
                // 2 factor authentication goes here

                const jwt = generateAccessToken(user);
                res.status(200).json({USER:user,TOKEN:jwt});
            }
            else
            {
                res.status(401).json({error:'Must verify email address or phone number.'});
            }
        });

        // incoming: UserID, Type, Location, Description, Start, End
        // outgoing: NEW_RESOURCE || error
        app.post('/api/addresource',[
            body('UserID').notEmpty().withMessage('UserID is required').isMongoId().withMessage('Invalid UserID'),
            body('Type').notEmpty().withMessage('Type is required'),
            body('Location').notEmpty().withMessage('Location is required'),
            body('Description').notEmpty().withMessage('Description is required'),
            body('Start').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Invalid start date'),
            body('End').notEmpty().withMessage('End date is required').isISO8601().withMessage('Invalid end date'),
        ],authenticateToken,handleValidationErrors,refreshToken,async(req,res) =>
        {
            const {UserID,Type,Location,Description,Start,End} = req.body;

            const existingResource = await db.collection('Resources').findOne({Type});
            if (existingResource)
            {
                return res.status(409).json({error:'Resource of this name already exists.'});
            }

            const insertedResource = await db.collection('Resources').insertOne(
            {
                UserID:ObjectId.createFromHexString(UserID),Type,Location,
                Description,Start:new Date(Start),End:new Date(End)
            });

            const newResource = await db.collection('Resources').findOne({_id:insertedResource.insertedId});
            res.status(201).json({NEW_RESOURCE:newResource});
        });

        // incoming: UserID, ResourceID, Type, Location, Description, Start, End
        // outgoing: UPDATED_RESOURCE || error
        app.post('/api/editresource',[
            body('UserID').notEmpty().withMessage('UserID is required').isMongoId().withMessage('Invalid UserID'),
            body('ResourceID').notEmpty().withMessage('ResourceID is required').isMongoId().withMessage('Invalid ResourceID'),
            body('Type').notEmpty().withMessage('Type is required'),
            body('Location').notEmpty().withMessage('Location is required'),
            body('Description').notEmpty().withMessage('Description is required'),
            body('Start').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Invalid start date'),
            body('End').notEmpty().withMessage('End date is required').isISO8601().withMessage('Invalid end date'),
        ],authenticateToken,handleValidationErrors,refreshToken,async(req,res) =>
        {
            const {UserID,ResourceID,Type,Location,Description,Start,End} = req.body;

            const editResource = await db.collection('Resources').findOne({_id:ObjectId.createFromHexString(ResourceID)});
            if (!editResource)
            {
                return res.status(404).json({error:'Resource not found.'});
            }
            
            const currentUser = await db.collection('Users').findOne({_id:ObjectId.createFromHexString(UserID)});
            if (!currentUser.IsAdmin && editResource.UserID.toString() !== UserID)
            {
                return res.status(403).json({error:'Unauthorized access to edit this resource.'});
            }

            const updatedResource = await db.collection('Resources').findOneAndUpdate(
                {_id:ObjectId.createFromHexString(ResourceID)},
                {$set:{Type,Location,Description,Start:new Date(Start),End:new Date(End)}},
                {returnDocument:'after'});

            res.status(200).json({UPDATED_RESOURCE:updatedResource});
        });

        // incoming: UserID, ResourceID
        // outgoing: DELETED_RESOURCE || error
        app.post('/api/deleteresource',[
            body('UserID').notEmpty().withMessage('UserID is required').isMongoId().withMessage('Invalid UserID'),
            body('ResourceID').notEmpty().withMessage('ResourceID is required').isMongoId().withMessage('Invalid ResourceID'),
        ],authenticateToken,handleValidationErrors,refreshToken,async(req,res) =>
        {
            const {UserID,ResourceID} = req.body;

            const deleteResource = await db.collection('Resources').findOne({_id:ObjectId.createFromHexString(ResourceID)});
            if (!deleteResource)
            {
                return res.status(404).json({error:'Resource not found.'});
            }

            const currentUser = await db.collection('Users').findOne({_id:ObjectId.createFromHexString(UserID)});
            if (!currentUser.IsAdmin && deleteResource.UserID.toString() !== UserID)
            {
                return res.status(403).json({error:'Unauthorized access to delete this resource.'});
            }

            const deletedResource = await db.collection('Resources').findOneAndDelete(
                {_id:ObjectId.createFromHexString(ResourceID)},
                {returnDocument:'before'});

            res.status(200).json({DELETED_RESOURCE:deleteResource});
        });

        // incoming: UserID, ResourceID, Comment, Start, End
        // outgoing: NEW_RESERVATION || error
        app.post('/api/addreservation',[
            body('UserID').notEmpty().withMessage('UserID is required').isMongoId().withMessage('Invalid UserID'),
            body('ResourceID').notEmpty().withMessage('ResourceID is required').isMongoId().withMessage('Invalid ResourceID'),
            body('Comment').optional(),
            body('Start').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Invalid start date'),
            body('End').notEmpty().withMessage('End date is required').isISO8601().withMessage('Invalid end date'),
        ],authenticateToken,handleValidationErrors,refreshToken,async(req,res) =>
        {
            const {UserID,ResourceID,Comment,Start,End} = req.body;

            const existingReservation = await db.collection('Reservations').findOne(
            {
                ResourceID:ObjectId.createFromHexString(ResourceID),
                $or:
                [
                    {Start:{$lt:new Date(End)},End:{$gt:new Date(Start)}},
                    {Start:{$gte:new Date(Start),$lte:new Date(End)}},
                    {End:{$gte:new Date(Start),$lte:new Date(End)}}
                ]
            });
            if (existingReservation)
            {
                return res.status(409).json({error:'Reservation overlaps with existing reservation.'});
            }

            const insertedReservation = await db.collection('Reservations').insertOne(
            {
                UserID:ObjectId.createFromHexString(UserID),
                ResourceID:ObjectId.createFromHexString(ResourceID),
                Comment,Start:new Date(Start),End:new Date(End)
            });

            const newReservation = await db.collection('Reservations').findOne({_id:insertedReservation.insertedId});
            res.status(201).json({NEW_RESERVATION:newReservation});
        });

        // incoming: UserID, ReservationID, Comment, Start, End
        // outgoing: UPDATED_RESERVATION || error
        app.post('/api/editreservation',[
            body('UserID').notEmpty().withMessage('UserID is required').isMongoId().withMessage('Invalid UserID'),
            body('ReservationID').notEmpty().withMessage('ReservationID is required').isMongoId().withMessage('Invalid ReservationID'),
            body('Comment').optional(),
            body('Start').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Invalid start date'),
            body('End').notEmpty().withMessage('End date is required').isISO8601().withMessage('Invalid end date'),
        ],authenticateToken,handleValidationErrors,refreshToken,async(req,res) =>
        {
            const {UserID,ReservationID,Comment,Start,End} = req.body;

            const editReservation = await db.collection('Reservations').findOne({_id:ObjectId.createFromHexString(ReservationID)});
            if (!editReservation)
            {
                return res.status(404).json({error:'Reservation not found.'});
            }

            const existingReservation = await db.collection('Reservations').findOne(
            {
                _id:{$ne:editReservation._id},
                ResourceID:editReservation.ResourceID,
                $or:
                [
                    {Start:{$lt:new Date(End)},End:{$gt:new Date(Start)}},
                    {Start:{$gte:new Date(Start),$lte:new Date(End)}},
                    {End:{$gte:new Date(Start),$lte:new Date(End)}}
                ]
            });
            if (existingReservation)
            {
                return res.status(409).json({error:'Reservation overlaps with existing reservation.'});
            }

            const currentUser = await db.collection('Users').findOne({_id:ObjectId.createFromHexString(UserID)});
            if (!currentUser.IsAdmin && editReservation.UserID.toString() !== UserID)
            {
                return res.status(403).json({error:'Unauthorized access to edit this reservation.'});
            }

            const updatedReservation = await db.collection('Reservations').findOneAndUpdate(
                {_id:ObjectId.createFromHexString(ReservationID)},
                {$set:{Comment,Start:new Date(Start),End:new Date(End)}},
                {returnDocument:'after'});

            res.status(200).json({UPDATED_RESERVATION:updatedReservation});
        });

        // incoming: UserID, ReservationID
        // outgoing: DELETED_RESERVATION || error
        app.post('/api/deletereservation',[
            body('UserID').notEmpty().withMessage('UserID is required').isMongoId().withMessage('Invalid UserID'),
            body('ReservationID').notEmpty().withMessage('ReservationID is required').isMongoId().withMessage('Invalid ReservationID'),
        ],authenticateToken,handleValidationErrors,refreshToken,async(req,res) =>
        {
            const {UserID,ReservationID} = req.body;

            const deleteReservation = await db.collection('Reservations').findOne({_id:ObjectId.createFromHexString(ReservationID)});
            if (!deleteReservation)
            {
                return res.status(404).json({error:'Reservation not found.'});
            }

            const currentUser = await db.collection('Users').findOne({_id:ObjectId.createFromHexString(UserID)});
            if (!currentUser.IsAdmin && deleteReservation.UserID.toString() !== UserID)
            {
                return res.status(403).json({error:'Unauthorized access to delete this reservation.'});
            }

            const deletedReservation = await db.collection('Reservations').findOneAndDelete(
                {_id:ObjectId.createFromHexString(ReservationID)},
                {returnDocument:'before'});

            res.status(200).json({DELETED_RESERVATION:deletedReservation});
        });
    }
    catch (e)
    {
        res.status(500).json({error:'Could not connect to the database. Please try again later.'});
    }
};