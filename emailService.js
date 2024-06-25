const AWS = require('aws-sdk');
const ses = new AWS.SES({region:'us-east-1'});

async function sendVerificationEmail(Email,VerificationToken)
{
    const verificationUrl = `https://ourdomain.com/verify?token=${VerificationToken}`;
    const params =
    {
        Destination:{ToAddresses:[Email]},
        Message:
        {
            Body:{Html:{Charset:'UTF-8',Data:`<html><body><p>Hello,</p><p>Please verify your email by clicking <a href="${verificationUrl}">this link</a>.</p></body></html>`}},
            Subject:{Charset:'UTF-8',Data:'Verification Email'}
        },
        Source: 'no-reply@ourdomain'
    };

    try
    {
        const data = await ses.sendEmail(params).promise();
        console.log(`Email sent: ${data.MessageId}`);
    }
    catch (e)
    {
        console.error('Error sending email:',e);
    }
}

module.exports = {sendVerificationEmail};