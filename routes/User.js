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
                "INSERT INTO users (username, password) VALUES ($1, $2);",
                [username, passwordHash]
            );
            // console.log(newInsert.rows[0]);
            res.json({
                registered: true,
                message: 'Sign Up Successful!'
            });
        } catch (err) {
            res.status(400).send({ error: err.message}); 
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
                        message: "Sign In Successful"
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
            res.status(400).send({ error: err.message}); 
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
            const {title, author, description} = req.body;
            const {username} = req.headers;

            //* modifying image resolution & format
            const imageMod = await sharp(buffer).resize({ width: 800, height: 800 }).png().toBuffer();

            //* check which one of these cases below happens
            if (!author && !description) {
                const newInsert = await pool.query(
                    "INSERT INTO imageart (username, image, title) VALUES ($1, $2, $3);",
                    [username, imageMod, title]
                );
            } else if (!author) {
                const newInsert = await pool.query(
                    "INSERT INTO imageart (username, image, title, description) VALUES ($1, $2, $3, $4);",
                    [username, imageMod, title, description]
                ); 
            } else if (!description) {
                const newInsert = await pool.query(
                    "INSERT INTO imageart (username, image, title, author) VALUES ($1, $2, $3, $4);",
                    [username, imageMod, title, author]
                );
            } else  {
                const newInsert = await pool.query(
                    "INSERT INTO imageart (username, image, title, author, description) VALUES ($1, $2, $3, $4, $5);",
                    [username, imageMod, title, author, description]
                ); 
            };
            // sending back the data 
            // res.json(newInsert.rows[0]);
            res.json({
                uploadArtWork: true,
                message: 'Image upload success'
            });
        } catch (err) {
            res.status(400).send({ error: err.message}); 
        };
    })
    .get( async (req,res) => {
        try {
            const {username} = req.headers;
            const findAll = await pool.query( 
                "SELECT * FROM imageart WHERE username = ($1);", 
                [username] 
            );
            if (findAll.rowCount) {
                res.send({
                    exist: true,
                    data: findAll.rows,
                    total: findAll.rowcount
                });
                // console.log(findAll.rows[0]);
            } else {
                console.log('image not found');
                res.send({
                    exist: false,
                    data: null,
                    total: null
                });
            };
        } catch (err) {
            res.status(400).send({ error: err.message}); 
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
                res.json({
                    exist: true,
                    data: findAll.rows
                });
            } else {
                console.log('profile not found');
                res.send({
                    exist: false,
                    data: null
                });
            };
        } catch (err) {
            res.status(400).send({ error: err.message}); 
        };
    })
    .post( upLoad.single('avatar'), async(req, res) =>{
        try {
            //* taking in input values from FE react
            const { buffer } = req.file;
            const { fullname, age, email, phone, location, gender, artstyle, bio } = req.body;
            const { username } = req.headers;

            //* check whether the user has existing profile or not
            const profile = await pool.query(
                "SELECT * FROM profile WHERE username = $1;", 
                [username]
            );
            //* if it doesn't have a profile then make a new one, else update the existing one
            if (!profile.rowCount) {
                //* check which data are sent and save the data to DB accordingly
                if (!buffer) {
                    const createProfile = await pool.query(
                        "INSERT INTO profile (username, fullname, age, email, phone, location, gender, artstyle, bio) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);",
                        [username, fullname, age, email, phone, location, gender, artstyle, bio]
                    );
                } else {
                    //* modifying image resolution & format
                    const imageMod = await sharp(buffer).resize({ width: 800, height: 800 }).png().toBuffer();

                    const createProfile = await pool.query(
                        "INSERT INTO profile (username, fullname, age, email, phone, location, gender, artstyle, bio, avatar) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);",
                        [username, fullname, age, email, phone, location, gender, artstyle, bio, imageMod]
                    );
                };
                res.json({
                    editProfile: true,
                    message: 'Profile is created'
                });
            } else {
                if (!buffer) {
                    const updateProfile = await pool.query(
                        "UPDATE profile SET fullname = $1, age = $2, email = $3, phone = $4, location = $5, gender = $6, artstyle = $7, bio = $8 WHERE username = $9;",
                        [fullname, age, email, phone, location, gender, artstyle, bio, username]
                    );
                } else {
                    //* modifying image resolution & format
                    const imageMod = await sharp(buffer).resize({ width: 800, height: 800 }).png().toBuffer();

                    const updateProfile = await pool.query(
                        "UPDATE profile SET fullname = $1, age = $2, email = $3, phone = $4, location = $5, gender = $6, artstyle = $7, bio = $8, avatar = $9 WHERE username = $10;",
                        [fullname, age, email, phone, location, gender, artstyle, bio, imageMod, username]
                    );
                };
                res.json({
                    editProfile: true,
                    message: 'Profile is updated'
                });
            }
        } catch (err) {
            res.status(400).send({ error: err.message}); 
        }
    });


router
    .route('/game')
    .get( async (req,res) => {
        try {
            const {username} = req.headers;
            const findAll = await pool.query( 
                "SELECT * FROM play WHERE username = ($1);", 
                [username] 
            );
            if (findAll.rowCount) {
                res.json({
                    exist: true,
                    data: findAll.rows
                });
            } else {
                console.log('game has never been played before');
                res.send({
                    exist: false,
                    data: null
                });
            };
        } catch (err) {
            res.status(400).send({ error: err.message}); 
        };
    })
    .post( async(req, res) =>{
        try {
            //* get the incoming data
            const result = req.body;
            const {username, game} = req.headers;
            console.log(result, username, game);

            //* insert the value into database
            const newInsert = await pool.query(
                "INSERT INTO play (username, game, result) VALUES ($1, $2, $3);",
                [username, game, result]
            );
            res.json({
                insertGameResult: true,
                message: 'Game result successfully inserted'
            });
        } catch (err) {
            res.status(400).send({ error: err.message}); 
        };
    });




module.exports = router;