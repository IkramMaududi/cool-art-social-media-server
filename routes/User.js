const express = require('express');
const pool = require('../db/pool');
const bcrypt = require('bcrypt');

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
            passwordHash = await bcrypt.hash(password,8);
            console.log(username, passwordHash);
            const newInsert = await pool.query(
                "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *;",
                [username, passwordHash]
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
            const user = await pool.query(
                "SELECT * FROM users WHERE username = $1;", 
                [username]
            );
            if (user.rowCount) {
                const isMatch = await bcrypt.compare(password, user.rows[0].password);
                if (isMatch) {
                    res.json({
                        loggedIn: true,
                        username
                    });
                } else {
                    res.json({
                        loggedIn: false,
                        message: "Wrong username/password combo!"
                    });
                };
            } else {
                    res.json({
                        loggedIn: false,
                        message: "User doesn't exist"
                    });
            };
        } catch (err) {
            console.error(err.message);
        };
    });

module.exports = router;