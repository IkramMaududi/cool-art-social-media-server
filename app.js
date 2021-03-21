const express = require('express');
const cors = require('cors');
const userRoute = require('./routes/User');

const app = express();

//middleware
app.use(cors()); //cors is used to allow request from backend to frontend 
app.use(express.json());
app.use(express.urlencoded({ extended:true }));

app.use('/user', userRoute);

app.get('/', (req,res) => {
    res.send('hello root');
});

module.exports = app;