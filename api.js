require('express');
const bcrypt = require('bcrypt');
const {ObjectId} = require('mongodb');
// const {generateTokens} = require('./JWT');
const {body,validationResult} = require('express-validator');


/*  API Endpoints:

    FUNCTIONAL:

    Users: Register | Login
    Resources: Add | Edit | Delete
    Reservations: Add | Edit | Delete
    ...

    TODO:

    Email/phone verification

    ...

    ALL need Json Web Token (JWT) implementation

*/

exports.setApp = function (app, client)
{
    // incoming: FirstName, LastName, Login, Password, Email, Phone
    // outgoing: newUser || error
    app.post('/api/register',[
        body('FirstName').notEmpty().withMessage('First name is required'),
        body('LastName').notEmpty().withMessage('Last name is required'),
        body('Login').notEmpty().withMessage('Login is required'),
        body('Password').notEmpty().withMessage('Password is required').isLength({min:6}).withMessage('Password must be at least 6 characters long'),
        body('Email').notEmpty().withMessage('Email address is required').isEmail().withMessage('Invalid email address'),
        body('Phone').notEmpty().withMessage('Phone number is required').matches(/^\d{3}-\d{3}-\d{4}$/).withMessage('Invalid phone number'),
    ],async (req, res, next) =>
    {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            return res.status(400).json({errors:errors.array()});
        }

        const {FirstName,LastName,Login,Password,Email,Phone} = req.body;

        try
        {
            const db = client.db('Scheduler');

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
                IsAdmin:false,EmailVerified:false,PhoneVerified:false
            });

            const newUser = await db.collection('Users').findOne({_id:insertedUser.insertedId});
            res.status(201).json(newUser);
        }
        catch (e)
        {
            console.error('Error during user registration:', e);
            res.status(500).json({error:'Could not connect to the database. Please try again later.'});
        }
    });

    // incoming: Login, Password
    // outgoing: user || error
    app.post('/api/login',[
        body('Login').notEmpty().withMessage('Login is required'),
        body('Password').notEmpty().withMessage('Password is required'),
    ],async (req, res, next) =>
    {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            return res.status(400).json({errors:errors.array()});
        }

        const {Login,Password} = req.body;

        try
        {
            const db = client.db('Scheduler');

            const user = await db.collection('Users').findOne({Login});
            if (user)
            {
                const passwordMatch = await bcrypt.compare(Password, user.Password);
                if (passwordMatch)
                {
                    if (user.EmailVerified || user.PhoneVerified)
                    {
                        // 2 factor authentication
    
                        res.status(200).json(user);
                    }
                    else
                    {
                        res.status(401).json({error:'Must verify email address or phone number.'});
                    }
                }
                else
                {
                    res.status(401).json({error:'Login/Password incorrect.'});
                }
            }
            else
            {
                res.status(401).json({error:'Login/Password incorrect.'});
            }
        }
        catch (e)
        {
            console.error('Error during user login:', e);
            res.status(500).json({error:'Could not connect to the database. Please try again later.'});
        }
    });

    // incoming: UserID, Type, Location, Description, Start, End
    // outgoing: newResource || error
    app.post('/api/addresource',[
        body('UserID').notEmpty().withMessage('UserID is required').isMongoId().withMessage('Invalid UserID'),
        body('Type').notEmpty().withMessage('Type is required'),
        body('Location').notEmpty().withMessage('Location is required'),
        body('Description').notEmpty().withMessage('Description is required'),
        body('Start').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Invalid start date'),
        body('End').notEmpty().withMessage('End date is required').isISO8601().withMessage('Invalid end date'),
    ],async (req, res, next) =>
    {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            return res.status(400).json({errors:errors.array()});
        }

        const {UserID,Type,Location,Description,Start,End} = req.body;

        try
        {
            const db = client.db('Scheduler');

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
            res.status(201).json(newResource);
        }
        catch (e)
        {
            console.error('Error during resource creation:', e);
            res.status(500).json({error:'Could not connect to the database. Please try again later.'});
        }
    });

    // incoming: UserID, ResourceID, Type, Location, Description, Start, End
    // outgoing: updatedResource || error
    app.post('/api/editresource',[
        body('UserID').notEmpty().withMessage('UserID is required').isMongoId().withMessage('Invalid UserID'),
        body('ResourceID').notEmpty().withMessage('ResourceID is required').isMongoId().withMessage('Invalid ResourceID'),
        body('Type').notEmpty().withMessage('Type is required'),
        body('Location').notEmpty().withMessage('Location is required'),
        body('Description').notEmpty().withMessage('Description is required'),
        body('Start').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Invalid start date'),
        body('End').notEmpty().withMessage('End date is required').isISO8601().withMessage('Invalid end date'),
    ],async (req, res, next) =>
    {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            return res.status(400).json({errors:errors.array()});
        }

        const {UserID,ResourceID,Type,Location,Description,Start,End} = req.body;

        try
        {
            const db = client.db('Scheduler');

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

            res.status(200).json(updatedResource);
        }
        catch (e)
        {
            console.error('Error during resource update:', e);
            res.status(500).json({error:'Could not connect to the database. Please try again later.'});
        }
    });

    // incoming: UserID, ResourceID
    // outgoing: deletedResource || error
    app.post('/api/deleteresource',[
        body('UserID').notEmpty().withMessage('UserID is required').isMongoId().withMessage('Invalid UserID'),
        body('ResourceID').notEmpty().withMessage('ResourceID is required').isMongoId().withMessage('Invalid ResourceID'),
    ],async (req, res, next) =>
    {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            return res.status(400).json({errors:errors.array()});
        }

        const {UserID,ResourceID} = req.body;

        try
        {
            const db = client.db('Scheduler');
            
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

            res.status(200).json(deletedResource);
        }
        catch (e)
        {
            console.error('Error during resource deletion:', e);
            res.status(500).json({error:'Could not connect to the database. Please try again later.'});
        }
    });

    // incoming: UserID, ResourceID, Comment, Start, End
    // outgoing: newReservation || error
    app.post('/api/addreservation',[
        body('UserID').notEmpty().withMessage('UserID is required').isMongoId().withMessage('Invalid UserID'),
        body('ResourceID').notEmpty().withMessage('ResourceID is required').isMongoId().withMessage('Invalid ResourceID'),
        body('Comment').optional(),
        body('Start').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Invalid start date'),
        body('End').notEmpty().withMessage('End date is required').isISO8601().withMessage('Invalid end date'),
    ], async (req, res, next) =>
    {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            return res.status(400).json({errors:errors.array()});
        }

        const {UserID,ResourceID,Comment,Start,End} = req.body;

        try
        {
            const db = client.db('Scheduler');

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
            res.status(201).json(newReservation);
        }
        catch (e)
        {
            console.error('Error during reservation creation:', e);
            res.status(500).json({error:'Could not connect to the database. Please try again later.'});
        }
    });

    // incoming: UserID, ReservationID, Comment, Start, End
    // outgoing: updatedReservation || error
    app.post('/api/editreservation',[
        body('UserID').notEmpty().withMessage('UserID is required').isMongoId().withMessage('Invalid UserID'),
        body('ReservationID').notEmpty().withMessage('ReservationID is required').isMongoId().withMessage('Invalid ReservationID'),
        body('Comment').optional(),
        body('Start').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Invalid start date'),
        body('End').notEmpty().withMessage('End date is required').isISO8601().withMessage('Invalid end date'),
    ],async (req, res, next) =>
    {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            return res.status(400).json({errors:errors.array()});
        }

        const {UserID,ReservationID,Comment,Start,End} = req.body;

        try
        {
            const db = client.db('Scheduler');

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

            res.status(200).json(updatedReservation);
        }
        catch (e)
        {
            console.error('Error during reservation update:', e);
            res.status(500).json({error:'Could not connect to the database. Please try again later.'});
        }
    });

    // incoming: UserID, ReservationID
    // outgoing: deletedReservation || error
    app.post('/api/deletereservation',[
        body('UserID').notEmpty().withMessage('UserID is required').isMongoId().withMessage('Invalid UserID'),
        body('ReservationID').notEmpty().withMessage('ReservationID is required').isMongoId().withMessage('Invalid ReservationID'),
    ],async (req, res, next) =>
    {
        const errors = validationResult(req);
        if (!errors.isEmpty())
        {
            return res.status(400).json({errors:errors.array()});
        }

        const {UserID,ReservationID} = req.body;

        try
        {
            const db = client.db('Scheduler');

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

            res.status(200).json(deletedReservation);
        }
        catch (e)
        {
            console.error('Error during reservation deletion:', e);
            res.status(500).json({error:'Could not connect to the database. Please try again later.'});
        }
    });
}