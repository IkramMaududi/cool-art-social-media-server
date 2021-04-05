const express = require('express');
const bcrypt = require('bcryptjs');
const sharp = require('sharp');
const multer = require('multer');
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
            passwordHash = await bcrypt.hash(password,8);
            console.log(username, passwordHash);
            const newInsert = await pool.query(
                "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *;",
                [username, passwordHash]
            );
            // console.log(newInsert.rows[0]);
            res.json({
                registered: true,
                message: 'Registration success!'
            });
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
                        username,
                        message: "Login successful"
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

const upLoad = multer({
    limits: { fileSize: 2000000 },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image with png, jpg, or jpeg file extensions'));
        };
        cb(null, true);
    }
});
router
    .route('/artwork')
    .post( upLoad.single('image'), async (req,res) => {
        try {
            // receiving the data
            const {buffer} = req.file;
            const {username, title, author, description} = req.body;

            // modifying image resolution & format
            const imageMod = await sharp(buffer).resize({ width: 800, height: 800 }).png().toBuffer();

            // insert into psql DB
            // if everything is provided
            const newInsert = await pool.query(
                "INSERT INTO imageart (username, image, title, author, description) VALUES ($1, $2, $3, $4, $5) RETURNING *;",
                [username, imageMod, title, author, description]
            );

            /**
             * if everything is included 
                const newInsert = await pool.query(
                    "INSERT INTO imageart (username, image, title, author, description) VALUES ($1, $2, $3, $4, $5) RETURNING *;",
                    [username, imageMod, title, author, description]
                );

             * else if author & description aren't included
                const newInsert = await pool.query(
                    "INSERT INTO imageart (username, image, title) VALUES ($1, $2, $3) RETURNING *;",
                    [username, imageMod, title]
                );

             * else if only author isn't included
                const newInsert = await pool.query(
                    "INSERT INTO imageart (username, image, title, author, description) VALUES ($1, $2, $3, $4, $5) RETURNING *;",
                    [username, imageMod, title, author, description]
                );


             * else if only description isn't included
                const newInsert = await pool.query(
                    "INSERT INTO imageart (username, image, title, author) VALUES ($1, $2, $3, $4) RETURNING *;",
                    [username, imageMod, title, author]
                );
             */

            // sending back the data 
            // res.json(newInsert.rows[0]);
            res.json({
                uploadArtWork: true,
                message: 'Image upload success'
            });
        } catch (err) {
            res.status(400).send({ error: err.message });
        };
    })
    .get( async (req,res) => {
        try {
            const {username} = req.headers;
            // console.log(req.headers.username);
            // console.log(typeof(req.headers.username))
            const findAll = await pool.query( 
                "SELECT * FROM imageart WHERE username = ($1);", 
                [username] 
            );
            if (findAll.rowCount) {
                res.json(findAll.rows);
            } else {
                console.log('image not found');
                res.end();
            };
        } catch (err) {
            res.status(400).send({ error: err.message });
        };
    });




router
    .route('/profile')
    .get( async (req,res) => {
        try {
            const {username} = req.headers;
            const findAll = await pool.query( 
                "SELECT * FROM profile WHERE username = ($1);", 
                [username] 
            );
            if (findAll.rowCount) {
                // send the data back
                res.json(findAll.rows);
            } else {
                console.log('profile not found');
                res.end();
            };
        } catch (err) {
            res.status(400).send({ error: err.message });
        };

    })
    .post()
    .patch();



router
    .route('/game')
    .post( async(req, res) =>{
        try {
            const result = req.body;
            const {username, game} = req.headers;
            console.log(result, username, game);
            // get the value into database
            const newInsert = await pool.query(
                "INSERT INTO play (username, game, result) VALUES ($1, $2, $3) RETURNING *;",
                [username, game, result]
            );
            res.json({
                insertGameResult: true,
                message: 'Game result successfully inserted'
            });
        } catch (error) {
            res.status(400).send({ error: err.message }); 
        }
    });




module.exports = router;