require('express');
const {ObjectId, ReturnDocument} = require('mongodb');

/*  API Endpoints:

    Users: Register | Login
    Resources: Add | Edit | Delete
    Reservations: Add | Edit | Delete
    ...
    Email/phone verification
    ...
    (Admins can modify all resources and reservations, users only modify owned)

    Needs Json Web Token (JWT) implemented

*/

exports.setApp = function (app, client)
{
    // might want to add password hashing?
    app.post('/api/register', async (req, res, next) =>
    {
        // incoming: FirstName, LastName, Login, Password, Email, Phone
        // outgoing: newUser || error

        const {FirstName,LastName,Login,Password,Email,Phone} = req.body;

        try
        {
            const db = client.db('Scheduler');
            const existingUser = await db.collection('Users').findOne({Login});

            if (existingUser)
            {
                return res.status(409).json({error:'Username already exists.'});
            }

            const insertedUser = await db.collection('Users').insertOne(
            {
                FirstName,LastName,Login,Password,Email,Phone,
                IsAdmin:false,EmailVerified:false,PhoneVerified:false
            });

            const newUser = await db.collection('Users').findOne({_id:insertedUser.insertedId});
            res.status(201).json(newUser);
        }
        catch (e)
        {
            console.error('Error during user registration:', e);
            res.status(500).json({error:'Could not connect to the databsase. Please try again later.'});
        }
    });

    // email/phone 2 factor authentication prior to login?
    app.post('/api/login', async (req, res, next) =>
    {
        // incoming: Login, Password
        // outgoing: user || error
        
        const {Login,Password} = req.body;

        try
        {
            const db = client.db('Scheduler');
            const user = await db.collection('Users').findOne({Login});

            if (user && Password === user.Password)
            {
                if (user.EmailVerified || user.PhoneVerified)
                {
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
        catch (e)
        {
            console.error('Error during user login:', e);
            res.status(500).json({error:'Could not connect to the databsase. Please try again later.'});
        }
    });

    app.post('/api/addresource', async (req, res, next) =>
    {
        // incoming: UserID, Type, Location, Description, Start, End
        // outgoing: newResource || error

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
            res.status(500).json({error:'Could not connect to the databsase. Please try again later.'});
        }
    });

    app.post('/api/editresource', async (req, res, next) =>
    {
        // incoming: UserID, ResourceID, Type, Location, Description, Start, End
        // outgoing: updatedResource || error

        const {UserID,ResourceID,Type,Location,Description,Start,End} = req.body;

        try
        {
            const db = client.db('Scheduler');
            const currentUser = await db.collection('Users').findOne({_id:ObjectId.createFromHexString(UserID)});
            const editResource = await db.collection('Resources').findOne({_id:ObjectId.createFromHexString(ResourceID)});

            if (!editResource)
            {
                return res.status(404).json({error:'Resource not found.'});
            }

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
            res.status(500).json({error:'Could not connect to the databsase. Please try again later.'});
        }
    });

    app.post('/api/deleteresource', async (req, res, next) =>
    {
        // incoming: UserID, ResourceID
        // outgoing: deletedResource || error

        const {UserID,ResourceID} = req.body;

        try
        {
            const db = client.db('Scheduler');
            const currentUser = await db.collection('Users').findOne({_id:ObjectId.createFromHexString(UserID)});
            const deleteResource = await db.collection('Resources').findOne({_id:ObjectId.createFromHexString(ResourceID)});

            if (!deleteResource)
            {
                return res.status(404).json({error:'Resource not found.'});
            }

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
            res.status(500).json({error:'Could not connect to the databsase. Please try again later.'});
        }
    });

    app.post('/api/addreservation', async (req, res, next) =>
    {
        // incoming: UserID, ResourceID, Comment, Start, End
        // outgoing: newReservation || error

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
            res.status(500).json({error:'Could not connect to the databsase. Please try again later.'});
        }
    });
    
    app.post('/api/editreservation', async (req, res, next) =>
    {
        // incoming: UserID, ReservationID, Comment, Start, End
        // outgoing: updatedReservation || error

        const {UserID,ReservationID,Comment,Start,End} = req.body;

        try
        {
            const db = client.db('Scheduler');
            const currentUser = await db.collection('Users').findOne({_id:ObjectId.createFromHexString(UserID)});
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
            res.status(500).json({error:'Could not connect to the databsase. Please try again later.'});
        }
    });

    app.post('/api/deletereservation', async (req, res, next) =>
    {
        // incoming: UserID, ReservationID
        // outgoing: deletedReservation || error

        const {UserID,ReservationID} = req.body;

        try
        {
            const db = client.db('Scheduler');
            const currentUser = await db.collection('Users').findOne({_id:ObjectId.createFromHexString(UserID)});
            const deleteReservation = await db.collection('Reservations').findOne({_id:ObjectId.createFromHexString(ReservationID)});

            if (!deleteReservation)
            {
                return res.status(404).json({error:'Reservation not found.'});
            }

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
            res.status(500).json({error:'Could not connect to the databsase. Please try again later.'});
        }
    });
}