const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router
    .route('/')
    .get( (req,res) => {
        res.send('hello get /user/');
    });

router
    .route('/register')
    .post( async (req,res) => {
        try {
            const {username, password} = req.body;
            const newInsert = await pool.query(
                "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *;",
                [username, password]
            );
            res.json(newInsert.rows[0]);
        } catch (err) {
            console.error(err.message);
        };
    });

router
    .route('/login')
    .post( async (req,res) => {
        try {
            const {username, password} = req.body;
            const select = await pool.query(
                "SELECT * FROM users WHERE username = $1;", 
                [username]
            );
            if (select.rowCount) {
                if (password == select.rows[0].password) {
                    res.send("You're logged in");
                } else {
                    res.send("Wrong username/password");
                };
            } else {
                res.send("User doesn't exist");
            };
        } catch (err) {
            console.error(err.message);
        };
    });

module.exports = router;