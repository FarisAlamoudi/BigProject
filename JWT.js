const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateAccessToken = (user) =>
{
    const payload =
    {
        UserId:user._id,FirstName:user.FirstName,LastName:user.LastName
    };
    return jwt.sign(payload,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'});
}

const verifyAccessToken = (token) =>
{
    return jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
}

const refreshAccessToken = (token) =>
{
    const verified = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    return generateAccessToken(verified);
}

module.exports = {generateAccessToken,verifyAccessToken,refreshAccessToken};