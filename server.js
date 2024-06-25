const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const {MongoClient} = require('mongodb');
const {setApp} = require('./api');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(bodyParser.json());

try
{
    require('dotenv').config();
    const url = process.env.MONGODB_URL;
    const client = new MongoClient(url);
    client.connect()
    console.log('Connected to MongoDB');
    setApp(app,client);
}
catch(e)
{
    console.error('Error connecting to MongoDB:',e);
}

if (process.env.NODE_ENV === 'production')
{
    app.use(express.static('frontend/build'));
    app.get('*',(req,res) =>
    {
        res.sendFile(path.resolve(__dirname,'frontend','build','index.html'));
    });
}

app.listen(PORT,() =>
{
    console.log('Server listening on port ' + PORT);
});