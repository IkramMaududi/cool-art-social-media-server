const express = require('express');
const app = express();

const {Pool} = require("pg");
const pool = new Pool ({
    user: "postgres",
    password: null,
    host: "localhost",
    port: 5432,
    database: "socialmedia"
});

// app.get('/register', 
//     (req,res) => {pool.query("INSERT INTO users (username, password) VALUES ('sth', 'password');")

// });

app.listen(3001, (req,res) => {
    console.log('Server is running....');
});
