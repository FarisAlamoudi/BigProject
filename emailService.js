require("dotenv").config();
const sendGrid = require('@sendgrid/mail');
sendGrid.setApiKey(process.env.SENDGRID_API_KEY);
const bp = require('./frontend/src/pages/Path.js');

async function send(Email,msg)
{
    try
    {
        await sendGrid.send(msg);
        console.log(`Email sent to ${Email}`);
    }
    catch (e)
    {
        console.error('Error sending email:',e);
    }
}

async function sendVerification(Email,VerificationToken)
{
    const verificationUrl = bp.buildPath(`verify?token=${VerificationToken}`);
    const msg =
    {
        to:Email,
        from:'services@4331booking.com',
        subject:'Verification Email',
        html:`<p>Hello,</p><p>Please verify your email by clicking <a href="${verificationUrl}">this link</a>.</p>`,
    };
    await send(Email,msg);
}

async function sendReset(Email,ResetToken)
{
    const resetUrl = bp.buildPath(`reset?token=${ResetToken}`);
    const msg =
    {
        to:Email,
        from:'services@4331booking.com',
        subject:'Password Reset Email',
        html:`<p>Hello,</p><p>Please use the following code to reset your password:</p><p><strong>${ResetToken}</strong></p><p>Alternatively, you can reset your password by clicking <a href="${resetUrl}">this link</a>.</p>`,
    };
    await send(Email,msg);
}

module.exports = {sendVerification,sendReset};