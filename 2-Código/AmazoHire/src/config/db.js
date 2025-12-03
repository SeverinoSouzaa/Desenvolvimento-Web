const mysql = require('mysql2');
require('dotenv').config();

// Cria a conexão com o banco de dados usando as configurações do .env
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Transforma em promessas (para podermos usar async/await, que é mais moderno)
const db = pool.promise();

console.log(`📡 Conectado ao banco de dados: ${process.env.DB_NAME}`);

module.exports = db;