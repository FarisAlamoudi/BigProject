const AWS = require('aws-sdk');
const bp = require('./frontend/src/components/Path.js');
const ses = new AWS.SES({region:'us-east-1'});
require("aws-sdk/lib/maintenance_mode_message").suppress = true;

async function sendVerification(Email,VerificationToken)
{
    const verificationUrl = bp.BuildPath(`verify?token=${VerificationToken}`);
    const params =
    {
        Destination:{ToAddresses:[Email]},
        Message:
        {
            Body:{Html:{Charset:'UTF-8',Data:`<html><body><p>Hello,</p><p>Please verify your email by clicking <a href="${verificationUrl}">this link</a>.</p></body></html>`}},
            Subject:{Charset:'UTF-8',Data:'Verification Email'}
        },
        Source:'no-reply@4331booking.com'
    };

    try
    {
        const data = await ses.sendEmail(params).promise();
        console.log(`Email sent:${data.MessageId}`);
    }
    catch (e)
    {
        console.error('Error sending email:',e);
    }
}

async function sendReset(Email,ResetToken)
{
    const resetUrl = bp.BuildPath(`reset?token=${ResetToken}`);
    const params =
    {
        Destination:{ToAddresses:[Email]},
        Message:
        {
            Body:{Html:{Charset:'UTF-8',Data:`<html><body><p>Hello,</p><p>Please use the following code to reset your password:</p><p><strong>${ResetToken}</strong></p><p>Alternatively, you can reset your password by clicking <a href="${resetUrl}">this link</a>.</p></body></html>`}},
            Subject:{Charset:'UTF-8',Data:'Password Reset Email'}
        },
        Source:'no-reply@4331booking.com'
    };

    try
    {
        const data = await ses.sendEmail(params).promise();
        console.log(`Email sent:${data.MessageId}`);
    }
    catch (e)
    {
        console.error('Error sending email:',e);
    }
}

module.exports = {sendVerification,sendReset};