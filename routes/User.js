const express = require('express');
const bcrypt = require('bcryptjs');
const sharp = require('sharp');
// const multer = require('multer');
const pool = require('../db/pool');

const router = express.Router();
// const upLoad = multer({
//     limits: { fileSize: 2000000 },
//     fileFilter(req, file, cb) {
//         if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
//             return cb(new Error('Please upload an image with png, jpg, or jpeg file extensions'));
//         };
//         cb(null, true);
//     }
// });

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
            res.status(400).send({ error: err.message });
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

    // need to add foreign key in DB: userID
router
    .route('/upload')
    .post( async (req,res) => {
        try {
            console.log(req.body.image);
            // const {image, title, author, description} = req.body;
            // const imageMod = await sharp(image).resize({ width: 800, height: 800 }).png().toBuffer();
            // const newInsert = await pool.query(
            //     "INSERT INTO imagework (image, title, author, description) VALUES ($1, $2, $3, $4) RETURNING *;",
            //     [imageMod, title, author, description]
            // );
            // res.json(newInsert.rows[0]);
        } catch (err) {
            res.status(400).send({ error: err.message });
        };
    });

    // need to add foreign key in DB: userID
router
    .route('/download')
    .get( async (req,res) => {
        try {
            // const findAll = await pool.query( "SELECT * FROM imagework WHERE ;" );
            const findAll = await pool.query( "SELECT * FROM imagework;" );
            if (findAll.rowCount) {
                res.json(findAll.rows);
            } else {
                res.json({
                    message: 'Image not found'
                });
            };
        } catch (err) {
            res.status(400).send({ error: err.message });
        };
    });

module.exports = router;