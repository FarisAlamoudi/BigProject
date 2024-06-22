const jwt = require("jsonwebtoken");
require("dotenv");

function generateTokens(user)
{
    const accessTokenPayload = {userId: user._id};
    const refreshTokenPayload = {userId: user._id};

    const accessToken = jwt.sign(accessTokenPayload,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'});
    const refreshToken = jwt.sign(refreshTokenPayload,process.env.REFRESH_TOKEN_SECRET,{expiresIn:'7d'});

    return {accessToken,refreshToken};
}

function verifyAccessToken(token)
{
    try
    {
        return jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    }
    catch (error)
    {
        return null;
    }
}

function verifyRefreshToken(token)
{
    try
    {
        return jwt.verify(token,process.env.REFRESH_TOKEN_SECRET);
    }
    catch (error)
    {
        return null;
    }
}

function refreshToken(req, res)
{
    const refreshToken = req.body.refreshToken;

    if (!refreshToken)
    {
        return res.status(401).json({error:'Unauthorized: No refresh token provided'});
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded)
    {
        return res.status(401).json({error:'Unauthorized: Invalid refresh token'});
    }

    const accessTokenPayload = {userId:decoded.userId};
    const accessToken = jwt.sign(accessTokenPayload,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'});

    res.json({accessToken});
}

module.exports = {generateTokens,verifyAccessToken,verifyRefreshToken,refreshToken};