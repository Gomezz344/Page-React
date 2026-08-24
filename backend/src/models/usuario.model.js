import pool from "../config/db.js"
export const buscarUsuarioPorEmail = async (email) => {
    const [rows] = await pool.execute(
        "SELECT * FROM usuarios WHERE email = ? LIMIT 1",
        [email]
    );
    return rows[0]
};

export const crearUsuario = async (usuario) => {
    const { nombres, apellidos, tipo_documento, numero_documento, direccion, telefono, email, password, rol_id,} = usuario
    const [result] = await pool.execute(
        `INSERT INTO usuarios ( nombres, apellidos, tipo_documento, numero_documento, direccion, telefono, email, password, rol_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [nombres, apellidos, tipo_documento, numero_documento, direccion, telefono, email, password, rol_id]
    );
    return result.insertId;
}