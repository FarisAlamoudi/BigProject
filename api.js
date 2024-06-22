require('express');
const {ObjectId} = require('mongodb');

/*  API Endpoints:

    Users: Register | Login
    Resources: Add | Edit | Delete
    Reservations: Add | Edit | Delete
    ...
    (Admins can modify all resources and reservations, users only modify owned)

    NEEDS Json Web Token (JWT) stuff figured out

*/

exports.setApp = function (app, client)
{
    // var token = require('./createJWT.js');

    app.post('/api/register', async (req, res, next) =>
    {
        // incoming: FirstName, LastName, Login, Password, Email
        // outgoing: newUser || error

        const {FirstName,LastName,Login,Password,Email} = req.body;

        try
        {
            const db = client.db('Scheduler');
            const existingUser = await db.collection('Users').findOne({Login});

            if (existingUser)
            {
                return res.status(409).json({error:'Username already exists.'});
            }

            // might want to add password hashing and email/phone verification before inserting?

            // if email/phone verified
            const ret = await db.collection('Users').insertOne(
            {
                FirstName:FirstName,
                LastName:LastName,
                Login:Login,
                Password:Password,
                Email:Email,
                IsAdmin:false
            });

            // const tokenPayload = {userId:result._id};
            // const token = jwt.sign(tokenPayload, jwtSecret, {expiresIn: '1h'});

            // temporary return - should just return back to login page after correct email/phone verification
            const newUser = await db.collection('Users').findOne({_id:ret.insertedId});
            res.status(201).json(newUser);
        }
        catch (e)
        {
            console.error('Error during user registration:', e);
            res.status(500).json({error:'Could not connect to the databsase. Please try again later.'});
        }
    });

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
                // id = user[0]._id;
                // fn = user[0].FirstName;
                // ln = user[0].LastName;

                // try
                // {
                //     const token = require("./createJWT.js");
                //     user = token.createToken( fn, ln, id );
                // }
                // catch(e)
                // {
                //     user = {error:e.message};
                // }

                // send 2FA to email/phone
                res.status(200).json(user);
            }
            else
            {
                res.status(401).json({error:'Login/Password Incorrect.'});
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
        // incoming: UserID, Type, Start, End
        // outgoing: newResource || error

        // const {UserID, Type, Start, End, jwtToken} = req.body;
        const {UserID, Type, Start, End} = req.body;

        // try
        // {
        //     if (token.isExpired(jwtToken))
        //     {
        //         var r = {error:'The JWT is no longer valid', jwtToken: ''};
        //         res.status(200).json(r);
        //         return;
        //     }
        // }
        // catch(e)
        // {
        //     console.log(e.message);
        //     var r = {error:e.message, jwtToken: ''};
        //     res.status(200).json(r);
        //     return;
        // }

        try
        {
            const db = client.db('Scheduler');
            const existingResource = await db.collection('Resources').findOne({Type});

            if (existingResource)
            {
                return res.status(409).json({error:'Resource of this name already exists.'});
            }

            const ret = await db.collection('Resources').insertOne({
                // works but idk
                UserID:new ObjectId(UserID),
                Type:Type,
                Start:new Date(Start),
                End:new Date(End)
            });

            // temporary return - probably dont need to return anything
            const newResource = await db.collection('Resources').findOne({_id:ret.insertedId});
            res.status(201).json(newResource);
        }
        catch (e)
        {
            console.error('Error during resource creation:', e);
            res.status(500).json({error:'Could not connect to the databsase. Please try again later.'});
        }

        // var refreshedToken = null;
        // try
        // {
        //     refreshedToken = token.refresh(jwtToken);
        // }
        // catch(e)
        // {
        //     console.log(e.message);
        // }
    });

    app.post('/api/editresource', async (req, res, next) =>
    {
        // incoming: UserID, ResourceID, NewType, NewStart, NewEnd
        // outgoing: updatedResource || error

        // const {UserID, ResourceID, jwtToken} = req.body;
        const {UserID, ResourceID, NewType, NewStart, NewEnd} = req.body;

        // try
        // {
        //     if (token.isExpired(jwtToken))
        //     {
        //         var r = {error:'The JWT is no longer valid', jwtToken: ''};
        //         res.status(200).json(r);
        //         return;
        //     }
        // }
        // catch(e)
        // {
        //     console.log(e.message);
        //     var r = {error:e.message, jwtToken: ''};
        //     res.status(200).json(r);
        //     return;
        // }

        try
        {
            const db = client.db('Scheduler');
            const currentUser = await db.collection('Users').findOne({_id:new ObjectId(UserID)});
            const editResource = await db.collection('Resources').findOne({_id:new ObjectId(ResourceID)});
            // console.log(editResource, ResourceID);
            // console.log(currentUser, UserID);

            // probably not needed, if its showing on the website it must exist?
            if (!editResource)
            {
                return res.status(404).json({error:'Resource not found.'});
            }

            if (!currentUser.IsAdmin && editResource.UserID.toString() !== UserID)
            {
                return res.status(403).json({error:'Unauthorized access to edit this resource.'});
            }

            // allow duplicates types (names) for now
            // const existingType = await db.collection('Resources').findOne({Type:NewType});
            // if (existingType)
            // {
            //     return res.status(409).json({error:'Resource name already exists.'});
            // }

            const updatedResource = await db.collection('Resources').findOneAndUpdate(
            {_id:new ObjectId(ResourceID)},
            {
                $set:
                {
                    Type:NewType,
                    Start:new Date(NewStart),
                    End:new Date(NewEnd)
                }
            },
            {returnOriginal:false});
            res.status(200).json(updatedResource);
        }
        catch (e)
        {
            console.error('Error during resource update:', e);
            res.status(500).json({error:'Could not connect to the databsase. Please try again later.'});
        }

        // var refreshedToken = null;
        // try
        // {
        //     refreshedToken = token.refresh(jwtToken);
        // }
        // catch(e)
        // {
        //     console.log(e.message);
        // }
    });
}