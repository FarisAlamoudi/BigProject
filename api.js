require('express');
const bcrypt = require('bcrypt');
const {ObjectId} = require('mongodb');
const {body,validationResult} = require('express-validator');
const {sendVerification,sendReset} = require('./emailService');
const {generateToken,authenticateToken} = require('./jwtUtils');

/*  API Endpoints:

    FUNCTIONAL:

    Users: Register | Login
    Resources: Add | Edit | Delete | Show
    Reservations: Add | Edit | Delete | Show

    --------------------------------------

    TODO:

    Edit user / settings (dark mode, etc)?
    Login: phone 2FA

*/

const handleValidationErrors = (req,res,next) =>
{
    const errors = validationResult(req);
    if (!errors.isEmpty())
    {
        return res.status(400).json({errors:errors.array()});
    }
    next();
};

exports.setApp = function(app,client)
{
    try
    {
        const db = client.db('Scheduler');

        // incoming: FirstName, LastName, Login, Password, Email, Phone
        // outgoing: success || error
        app.post('/api/register',[
            body('FirstName').notEmpty().withMessage('First name is required'),
            body('LastName').notEmpty().withMessage('Last name is required'),
            body('Login').notEmpty().withMessage('Login is required'),
            body('Password').notEmpty().withMessage('Password is required').matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\-]).{7,}$/).withMessage('Invalid password'),
            body('Email').notEmpty().withMessage('Email address is required').isEmail().withMessage('Invalid email address'),
            body('Phone').notEmpty().withMessage('Phone number is required').matches(/^\d{3}-\d{3}-\d{4}$/).withMessage('Invalid phone number')
        ],handleValidationErrors,async(req,res) =>
        {
            const {FirstName,LastName,Login,Password,Email,Phone} = req.body;

            const existingLogin = await db.collection('Users').findOne({Login});
            if (existingLogin)
            {
                return res.status(409).json({error:'User name already connected to a ___.com account. Reset your password here.'});
            }

            const existingEmail = await db.collection('Users').findOne({Email});
            if (existingEmail)
            {
                return res.status(409).json({error:'Email already connected to a ___.com account. Reset your password here.'});
            }

            const verificationToken = Math.random().toString(36) + Date.now().toString(36);
            const hashedPassword = await bcrypt.hash(Password, 10);
            const insertedUser = await db.collection('Users').insertOne(
            {
                FirstName,LastName,Login,Password:hashedPassword,Email,Phone,
                IsAdmin:false,EmailVerified:false,VerificationToken:verificationToken
            });

            const newUser = await db.collection('Users').findOne({_id:insertedUser.insertedId});
            sendVerification(newUser.Email,newUser.VerificationToken);
            return res.status(201).json({success:'User registered, verify email address to login.'});
        });

        // incoming: VerificationToken
        // outgoing: success || error
        app.post('/api/verifyemail',[
            body('VerificationToken').notEmpty().withMessage('Verification token is required'),
        ],handleValidationErrors,async(req,res) =>
        {
            const {VerificationToken} = req.body;

            const user = await db.collection('Users').findOne({VerificationToken});
            if (!user)
            {
                return res.status(404).json({error:'Verification token not found or expired.'});
            }

            if (!user.EmailVerified)
            {
                await db.collection('Users').updateOne({_id:user._id},{$set:{EmailVerified:true}});
            }
            else
            {
                return res.status(400).json({error:'Email already verified.'});
            }
            return res.status(200).json({success:'Email Verified'});
        });

        //app,post('/api/edituser')

        // incoming: Email
        // outgoing: RESET_TOKEN || error
        app.post('/api/sendresettoken',[
            body('Email').notEmpty().withMessage('Email is required'),
        ],handleValidationErrors,async(req,res) =>
        {
            const {Email} = req.body;

            const user = await db.collection('Users').findOne({Email});
            if (!user)
            {
                return res.status(401).json({error:'Email does not belong to a ___.com account.'});
            }

            const resetToken = Math.random().toString(36).substring(2,8);
            sendReset(user.Email,resetToken);
            return res.status(200).json({RESET_TOKEN:resetToken});
        });

        // incoming: Login, Password
        // outgoing: JWT || error
        app.post('/api/login',[
            body('Login').notEmpty().withMessage('Login is required'),
            body('Password').notEmpty().withMessage('Password is required')
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

            if (user.EmailVerified)
            {
                // phone 2 factor auth

                const JWT = generateToken(user);
                return res.status(200).json({JWT});
            }
            else
            {
                return res.status(401).json({error:'Must verify email address to login.'});
            }
        });

        // incoming: JWT, Type, Location, Description, Start, End
        // outgoing: NEW_RESOURCE || error
        app.post('/api/addresource',[
            body('Type').notEmpty().withMessage('Type is required'),
            body('Location').notEmpty().withMessage('Location is required'),
            body('Description').notEmpty().withMessage('Description is required'),
            body('Start').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Invalid start date'),
            body('End').notEmpty().withMessage('End date is required').isISO8601().withMessage('Invalid end date')
        ],handleValidationErrors,async(req,res) =>
        {
            try
            {
                const {UserID} = authenticateToken(req);
                const {Type,Location,Description,Start,End} = req.body;

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
                return res.status(201).json({NEW_RESOURCE:newResource});
            }
            catch(e)
            {
                return res.status(401).json({error:e.message});
            }
        });

        // incoming: JWT, ResourceID, Type, Location, Description, Start, End
        // outgoing: UPDATED_RESOURCE || error
        app.post('/api/editresource',[
            body('ResourceID').notEmpty().withMessage('ResourceID is required').isMongoId().withMessage('Invalid ResourceID'),
            body('Type').notEmpty().withMessage('Type is required'),
            body('Location').notEmpty().withMessage('Location is required'),
            body('Description').notEmpty().withMessage('Description is required'),
            body('Start').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Invalid start date'),
            body('End').notEmpty().withMessage('End date is required').isISO8601().withMessage('Invalid end date')
        ],handleValidationErrors,async(req,res) =>
        {
            try
            {
                const {UserID,IsAdmin} = authenticateToken(req);
                const {ResourceID,Type,Location,Description,Start,End} = req.body;

                const editResource = await db.collection('Resources').findOne({_id:ObjectId.createFromHexString(ResourceID)});
                if (!editResource)
                {
                    return res.status(404).json({error:'Resource not found.'});
                }
                
                if (!IsAdmin && editResource.UserID.toString() !== UserID)
                {
                    return res.status(403).json({error:'Unauthorized access to edit this resource.'});
                }

                const updatedResource = await db.collection('Resources').findOneAndUpdate(
                    {_id:editResource._id},{$set:{Type,Location,Description,Start:new Date(Start),End:new Date(End)}},{returnDocument:'after'});

                return res.status(200).json({UPDATED_RESOURCE:updatedResource});
            }
            catch(e)
            {
                return res.status(401).json({error:e.message});
            }
        });

        // incoming: JWT, ResourceID
        // outgoing: DELETED_RESOURCE || error
        app.post('/api/deleteresource',[
            body('ResourceID').notEmpty().withMessage('ResourceID is required').isMongoId().withMessage('Invalid ResourceID')
        ],handleValidationErrors,async(req,res) =>
        {
            try
            {
                const {UserID,IsAdmin} = authenticateToken(req);
                const {ResourceID} = req.body;

                const deleteResource = await db.collection('Resources').findOne({_id:ObjectId.createFromHexString(ResourceID)});
                if (!deleteResource)
                {
                    return res.status(404).json({error:'Resource not found.'});
                }

                if (!IsAdmin && deleteResource.UserID.toString() !== UserID)
                {
                    return res.status(403).json({error:'Unauthorized access to delete this resource.'});
                }

                await db.collection('Resources').findOneAndDelete({_id:deleteResource._id});

                return res.status(200).json({DELETED_RESOURCE:deleteResource});
            }
            catch(e)
            {
                return res.status(401).json({error:e.message});
            }
        });

        // incoming: Search
        // outgoing: RESOURCES || error
        app.post('/api/showresources',async(req,res) =>
        {
            const {Query} = req.body;
            let filter = {};
        
            if (Query)
            {
                const fields = ['Type','Location','Description','Start','End'];
                filter = {$or:fields.map(field => ({[field]:{$regex:new RegExp(Query,'i')}}))};
            }
        
            try
            {
                let resources;
                if (Object.keys(filter).length === 0)
                {
                    resources = await db.collection('Resources').find().toArray();
                }
                else
                {
                    resources = await db.collection('Resources').find(filter).toArray();
                }
                return res.status(200).json({RESOURCES:resources});
            }
            catch(e)
            {
                return res.status(500).json({error:e.message});
            }
        });

        // incoming: JWT, ResourceID, Comment, Start, End
        // outgoing: NEW_RESERVATION || error
        app.post('/api/addreservation',[
            body('ResourceID').notEmpty().withMessage('ResourceID is required').isMongoId().withMessage('Invalid ResourceID'),
            body('Comment').optional(),
            body('Start').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Invalid start date'),
            body('End').notEmpty().withMessage('End date is required').isISO8601().withMessage('Invalid end date')
        ],handleValidationErrors,async(req,res) =>
        {
            try
            {
                const {UserID} = authenticateToken(req);
                const {ResourceID,Comment,Start,End} = req.body;

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
                return res.status(201).json({NEW_RESERVATION:newReservation});
            }
            catch(e)
            {
                return res.status(401).json({error:e.message});
            }
        });

        // incoming: JWT, ReservationID, Comment, Start, End
        // outgoing: UPDATED_RESERVATION || error
        app.post('/api/editreservation',[
            body('ReservationID').notEmpty().withMessage('ReservationID is required').isMongoId().withMessage('Invalid ReservationID'),
            body('Comment').optional(),
            body('Start').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Invalid start date'),
            body('End').notEmpty().withMessage('End date is required').isISO8601().withMessage('Invalid end date')
        ],handleValidationErrors,async(req,res) =>
        {
            try
            {
                const {UserID,IsAdmin} = authenticateToken(req);
                const {ReservationID,Comment,Start,End} = req.body;

                const editReservation = await db.collection('Reservations').findOne({_id:ObjectId.createFromHexString(ReservationID)});
                if (!editReservation)
                {
                    return res.status(404).json({error:'Reservation not found.'});
                }

                const existingReservation = await db.collection('Reservations').findOne(
                {
                    _id:{$ne:editReservation._id},ResourceID:editReservation.ResourceID,
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

                if (!IsAdmin && editReservation.UserID.toString() !== UserID)
                {
                    return res.status(403).json({error:'Unauthorized access to edit this reservation.'});
                }

                const updatedReservation = await db.collection('Reservations').findOneAndUpdate(
                    {_id:editReservation._id},{$set:{Comment,Start:new Date(Start),End:new Date(End)}},{returnDocument:'after'});

                    return res.status(200).json({UPDATED_RESERVATION:updatedReservation});
            }
            catch(e)
            {
                return res.status(401).json({error:e.message});
            }
        });

        // incoming: JWT, ReservationID
        // outgoing: DELETED_RESERVATION || error
        app.post('/api/deletereservation',[
            body('ReservationID').notEmpty().withMessage('ReservationID is required').isMongoId().withMessage('Invalid ReservationID'),
        ],handleValidationErrors,async(req,res) =>
        {
            try
            {
                const {UserID,IsAdmin} = authenticateToken(req);
                const {ReservationID} = req.body;

                const deleteReservation = await db.collection('Reservations').findOne({_id:ObjectId.createFromHexString(ReservationID)});
                if (!deleteReservation)
                {
                    return res.status(404).json({error:'Reservation not found.'});
                }

                if (!IsAdmin && deleteReservation.UserID.toString() !== UserID)
                {
                    return res.status(403).json({error:'Unauthorized access to delete this reservation.'});
                }

                await db.collection('Reservations').deleteOne({_id:deleteReservation._id});

                return res.status(200).json({DELETED_RESERVATION:deleteReservation});
            }
            catch(e)
            {
                return res.status(401).json({error:e.message});
            }
        });

        // incoming: Search
        // outgoing: RESERVATIONS || error
        app.post('/api/showreservations',async(req,res) =>
        {
            const {Query} = req.body;
            let filter = {};
        
            if (Query)
            {
                const fields = ['Comment','Start','End'];
                filter = {$or:fields.map(field => ({[field]:{$regex:new RegExp(Query,'i')}}))};
            }
        
            try
            {
                let reservations;
                if (Object.keys(filter).length === 0)
                {
                    reservations = await db.collection('Reservations').find().toArray();
                }
                else
                {
                    reservations = await db.collection('Reservations').find(filter).toArray();
                }
                return res.status(200).json({RESERVATIONS:reservations});
            }
            catch(e)
            {
                return res.status(500).json({error:e.message});
            }
        });
    }
    catch (e)
    {
        res.status(500).json({error:'Could not connect to the database. Please try again later.'});
    }
};