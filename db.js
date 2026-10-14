const mysql = require("mysql2");
require("dotenv").config();

const conexion = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

conexion.getConnection((error, connection) => {
    if (error) {
        console.error("Error al conectar con MySQL:", error);
        return;
    }

    console.log("Conexión con MySQL establecida correctamente.");
    connection.release();
});

module.exports = conexion;
