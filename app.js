const express = require('express');
const userRoute = require('./routes/User');

const app = express();

app.use(express.json());
app.use('/user', userRoute);

app.get('/', (req,res) => {
    res.send('hello root');
});

module.exports = app;