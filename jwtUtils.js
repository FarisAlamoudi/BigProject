const jwt = require("jsonwebtoken");
require("dotenv").config();

function generateToken(user)
{
    const payload =
    {
        UserID:user._id,FirstName:user.FirstName,LastName:user.LastName,Login:user.Login,
        Email:user.Email,IsAdmin:user.IsAdmin,EmailVerified:user.EmailVerified
    };
    return jwt.sign(payload,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'});
}

function authenticateToken(req)
{
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    return jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
}

function refreshToken(token)
{
    const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    const payload =
    {
        UserID:decoded._id,FirstName:decoded.FirstName,LastName:decoded.LastName,Login:decoded.Login,
        Email:decoded.Email,IsAdmin:decoded.IsAdmin,EmailVerified:decoded.EmailVerified
    }
    return jwt.sign(payload,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'});
}

module.exports = {generateToken,authenticateToken,refreshToken};