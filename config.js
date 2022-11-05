const mysql = require('mysql2');
require('dotenv').config();

// example: {
    // host: 'localhost',
    // user: 'root',
    // password: 'Login_2022!',
    // database: 'shelftec'
// }

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE
    // ,
    // port: process.env.PORT
})

module.exports = connection;