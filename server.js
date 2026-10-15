const express = require("express");

const cors = require("cors");

require("dotenv").config();

const fs = require("fs");

const path = require("path");

const conexion = require("./db");

const bcrypt = require("bcrypt");

const app = express();

app.use(cors());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.use(express.json());

const PORT = process.env.PORT || 3000;

console.log("API_BASE_URL:", process.env.API_BASE_URL);

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
        correo,
        contacto_alumno,
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
        alumnos.correo,
        alumnos.contacto_alumno,
        alumnos.carrera,
        alumnos.cuatrimestre,
        alumnos.campus,
        alumnos.aula,
        alumnos.fotografia,
        alumnos.firma,
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

app.post("/api/alumnos/guardar", (req, res) => {

    const {
        matricula,
        correo,
        contacto_alumno,
        contacto_emergencia,
        foto,
        firma
    } = req.body;

    // Verificar que la matrícula exista
    if (!matricula) {
        return res.status(400).json({
            error: "La matrícula es obligatoria"
        });
    }

    // Buscar al alumno por matrícula
    const sqlBuscar = `
        SELECT id
        FROM alumnos
        WHERE matricula = ?
    `;

    conexion.query(sqlBuscar, [matricula], (error, resultados) => {

        if (error) {
            console.error("Error al buscar alumno:", error);

            return res.status(500).json({
                error: "Error al buscar el alumno"
            });
        }

        if (resultados.length === 0) {
            return res.status(404).json({
                error: "Alumno no encontrado"
            });
        }

        const alumnoId = resultados[0].id;

        // Crear las rutas donde se guardarán los archivos
        const carpetaFotos = path.join(__dirname, "uploads", "fotos");
        const carpetaFirmas = path.join(__dirname, "uploads", "firmas");

        // Crear las carpetas si todavía no existen
        fs.mkdirSync(carpetaFotos, { recursive: true });
        fs.mkdirSync(carpetaFirmas, { recursive: true });

        // Guardar fotografía
        let rutaFoto = null;

        if (foto) {

            const datosFoto = foto.replace(/^data:image\/\w+;base64,/, "");

            const nombreFoto = `${matricula}.jpg`;

            const archivoFoto = path.join(
                carpetaFotos,
                nombreFoto
            );

            fs.writeFileSync(
                archivoFoto,
                Buffer.from(datosFoto, "base64")
            );

            rutaFoto = `uploads/fotos/${nombreFoto}`;
        }

        // Guardar firma
        let rutaFirma = null;

        if (firma) {

            const datosFirma = firma.replace(/^data:image\/\w+;base64,/, "");

            const nombreFirma = `${matricula}.png`;

            const archivoFirma = path.join(
                carpetaFirmas,
                nombreFirma
            );

            fs.writeFileSync(
                archivoFirma,
                Buffer.from(datosFirma, "base64")
            );

            rutaFirma = `uploads/firmas/${nombreFirma}`;
        }

        const sqlActualizar = `
    UPDATE alumnos
    SET
        correo = ?,
        contacto_alumno = ?,
        contacto_emergencia = ?,
        fotografia = ?,
        firma = ?
    WHERE id = ?
`;

        conexion.query(
            sqlActualizar,
            [
                correo || null,
                contacto_alumno || null,
                contacto_emergencia || null,
                rutaFoto,
                rutaFirma,
                alumnoId
            ],
            (error) => {

                if (error) {
                    console.error("Error al actualizar alumno:", error);

                    return res.status(500).json({
                        error: "Los archivos se guardaron, pero no fue posible actualizar al alumno"
                    });
                }

                res.json({
                    mensaje: "Alumno actualizado correctamente",
                    alumno_id: alumnoId,
                    matricula: matricula,
                    foto: rutaFoto,
                    firma: rutaFirma
                });
            }
        );
    });
});

app.listen(PORT, () => {
    console.log(`API funcionando en http://localhost:${PORT}`);
});