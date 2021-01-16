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
    .get( async (req,res) => {
        try {
          const newInsert = await pool.query(
            "INSERT INTO users (username, password) VALUES ('absfdg', 'pword') RETURNING *;"
          );
          res.json(newInsert.rows[0]);
        } catch (err) {
            console.error(err.message);
        };
    });

module.exports = router;