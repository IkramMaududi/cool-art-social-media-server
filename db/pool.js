const {Pool} = require("pg");

const pool = new Pool ({
    user: "postgres",
    password: null,
    host: "localhost",
    port: 5432,
    database: "socialmedia"
});

module.exports = pool;