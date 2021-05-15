const {Pool} = require("pg");
// const {Client} = require("pg");

// //* this is for local environment, otherwise comment this below
// const pool = new Pool ({
//     user: process.env.USER_PSQL,
//     password: process.env.PASSWORD_PSQL,
//     host: process.env.HOST_PSQL,
//     port: process.env.PORT_PSQL,
//     database: process.env.DATABASE_PSQL
// });

//* this is for production environment, otherwise comment this below
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;