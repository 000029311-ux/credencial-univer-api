const express = require("express");

const conexion = require("./db");

const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

console.log("API iniciando...");

app.get("/api", (req, res) => {
    res.json({
        mensaje: "La API de Credencial UNIVER funciona correctamente"
    });
});

app.get("/api/alumnos", (req, res) => {

    const sql = `
        SELECT
            id,
            nombre,
            apellido,
            matricula,
            carrera,
            cuatrimestre,
            campus,
            aula,
            contacto_emergencia
        FROM alumnos
    `;

    conexion.query(sql, (error, resultados) => {

        if (error) {
            console.error("Error al consultar alumnos:", error);

            return res.status(500).json({
                error: "Error al consultar los alumnos"
            });
        }

        res.json(resultados);
    });
});

app.get("/api/alumnos/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
        SELECT
            id,
            nombre,
            apellido,
            matricula,
            carrera,
            cuatrimestre,
            campus,
            aula,
            contacto_emergencia
        FROM alumnos
        WHERE id = ?
    `;

    conexion.query(sql, [id], (error, resultados) => {

        if (error) {
            console.error("Error al consultar alumno:", error);

            return res.status(500).json({
                error: "Error al consultar el alumno"
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                error: "Alumno no encontrado"
            });
        }

        res.json(resultados[0]);
    });
});

app.get("/api/alumnos/matricula/:matricula", (req, res) => {

    const matricula = req.params.matricula;

    const sql = `
        SELECT
            id,
            nombre,
            apellido,
            matricula,
            carrera,
            cuatrimestre,
            campus,
            aula,
            contacto_emergencia
        FROM alumnos
        WHERE matricula = ?
    `;

    conexion.query(sql, [matricula], (error, resultados) => {

        if (error) {
            console.error("Error al consultar alumno por matrícula:", error);

            return res.status(500).json({
                error: "Error al consultar el alumno"
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                error: "Alumno no encontrado"
            });
        }

        res.json(resultados[0]);
    });
});

app.get("/api/credenciales", (req, res) => {

    const sql = `
        SELECT
            id,
            alumno_id,
            vigencia,
            aula,
            codigo_qr,
            fecha_emision,
            status
        FROM credenciales
    `;

    conexion.query(sql, (error, resultados) => {

        if (error) {
            console.error("Error al consultar credenciales:", error);

            return res.status(500).json({
                error: "Error al consultar las credenciales"
            });
        }

        res.json(resultados);
    });
});

app.get("/api/credenciales/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
        SELECT
            credenciales.id,
            alumnos.id AS alumno_id,
            alumnos.nombre,
            alumnos.apellido,
            alumnos.matricula,
            alumnos.carrera,
            alumnos.cuatrimestre,
            alumnos.campus,
            alumnos.aula,
            credenciales.vigencia,
            credenciales.codigo_qr,
            credenciales.fecha_emision,
            credenciales.status
        FROM credenciales
        INNER JOIN alumnos
            ON credenciales.alumno_id = alumnos.id
        WHERE credenciales.id = ?
    `;

    conexion.query(sql, [id], (error, resultados) => {

        if (error) {
            console.error("Error al consultar credencial:", error);

            return res.status(500).json({
                error: "Error al consultar la credencial"
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                error: "Credencial no encontrada"
            });
        }

        res.json(resultados[0]);
    });
});

app.get("/api/credenciales/matricula/:matricula", (req, res) => {

    const matricula = req.params.matricula;

    const sql = `
        SELECT
            credenciales.id,
            alumnos.id AS alumno_id,
            alumnos.nombre,
            alumnos.apellido,
            alumnos.matricula,
            alumnos.carrera,
            alumnos.cuatrimestre,
            alumnos.campus,
            alumnos.aula,
            credenciales.vigencia,
            credenciales.codigo_qr,
            credenciales.fecha_emision,
            credenciales.status
        FROM credenciales
        INNER JOIN alumnos
            ON credenciales.alumno_id = alumnos.id
        WHERE alumnos.matricula = ?
    `;

    conexion.query(sql, [matricula], (error, resultados) => {

        if (error) {
            console.error("Error al consultar credencial por matrícula:", error);

            return res.status(500).json({
                error: "Error al consultar la credencial"
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                error: "Credencial no encontrada"
            });
        }

        res.json(resultados[0]);
    });
});

app.post("/api/usuarios/login", (req, res) => {

    const usuario = req.body.usuario;
    const password = req.body.password;

    const sql = `
        SELECT
            usuarios.id,
            usuarios.alumno_id,
            usuarios.nombre,
            usuarios.usuario,
            usuarios.password,
            usuarios.rol,
            alumnos.matricula,
            alumnos.carrera,
            alumnos.cuatrimestre,
            alumnos.campus,
            alumnos.aula,
            alumnos.contacto_emergencia
        FROM usuarios
        INNER JOIN alumnos
            ON usuarios.alumno_id = alumnos.id
        WHERE usuarios.usuario = ?
    `;

    conexion.query(sql, [usuario], (error, resultados) => {

        if (error) {
            console.error("Error al consultar usuario:", error);

            return res.status(500).json({
                error: "Error al consultar el usuario"
            });
        }

        if (resultados.length === 0) {
            return res.status(401).json({
                error: "Usuario o contraseña incorrectos"
            });
        }

        const usuarioBD = resultados[0];

        const hash = usuarioBD.password.replace("$2y$", "$2b$");

        bcrypt.compare(password, hash, (error, coincide) => {

            if (error) {
                console.error("Error al comprobar contraseña:", error);

                return res.status(500).json({
                    error: "Error al comprobar la contraseña"
                });
            }

            if (!coincide) {
                return res.status(401).json({
                    error: "Usuario o contraseña incorrectos"
                });
            }

            res.json({
                mensaje: "Login correcto",
                usuario: {
                    id: usuarioBD.id,
                    alumno_id: usuarioBD.alumno_id,
                    nombre: usuarioBD.nombre,
                    usuario: usuarioBD.usuario,
                    rol: usuarioBD.rol,
                    matricula: usuarioBD.matricula,
                    carrera: usuarioBD.carrera,
                    cuatrimestre: usuarioBD.cuatrimestre,
                    campus: usuarioBD.campus,
                    aula: usuarioBD.aula,
                    contacto_emergencia: usuarioBD.contacto_emergencia
                }
            });

        });

    });

});


app.listen(PORT, () => {
    console.log(`API funcionando en http://localhost:${PORT}`);
});