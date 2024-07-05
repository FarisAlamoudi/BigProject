const jwt = require("jsonwebtoken");
require("dotenv").config();

function generateToken(user) {
    try {
        const accessToken = jwt.sign(
            {
                UserID: user._id, FirstName: user.FirstName, LastName: user.LastName, UserName: user.UserName,
                Email: user.Email, Phone: user.Phone, IsAdmin: user.IsAdmin, EmailVerified: user.EmailVerified,
                DarkMode: user.DarkMode, PublicInfo: user.PublicInfo, VerificationToken: user.VerificationToken
            }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '10s'})

        var returnValue = { JWT: accessToken };
    }
    catch (e) {
        var returnValue = { error: e.message };
    }
    return returnValue;
}

async function isTokenValid(token){
    return new Promise((resolve) => {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err) => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

function refreshToken(token) {
    const decoded = jwt.decode(token, { complete: true });
    return generateToken(decoded.payload);
}

module.exports = { generateToken, isTokenValid, refreshToken };
