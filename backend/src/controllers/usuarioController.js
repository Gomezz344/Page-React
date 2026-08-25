const bcrypt = require('bcrypt');
const pool = require('../config/database');

const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await pool.query(`
      SELECT
        id,
        nombre,
        apellido,
        tipo_documento,
        numero_documento,
        direccion,
        telefono,
        correo,
        rol_id,
        estado,
        fecha_registro
      FROM usuarios
      ORDER BY id DESC
    `);

    res.status(200).json({
      usuarios,
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);

    res.status(500).json({
      message: 'Error interno del servidor.',
    });
  }
};


const crearUsuario = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      tipo_documento,
      numero_documento,
      direccion,
      telefono,
      correo,
      password,
      rol_id,
    } = req.body;

    // Validar campos obligatorios
    if (
      !nombre ||
      !apellido ||
      !tipo_documento ||
      !numero_documento ||
      !direccion ||
      !telefono ||
      !correo ||
      !password ||
      !rol_id
    ) {
      return res.status(400).json({
        message: 'Todos los campos son obligatorios.',
      });
    }

    // Comprobar si ya existe el correo
    const usuarioCorreo = await pool.query(
      'SELECT id FROM usuarios WHERE correo = ? LIMIT 1',
      [correo]
    );

    if (usuarioCorreo.length > 0) {
      return res.status(409).json({
        message: 'El correo ya está registrado.',
      });
    }

    // Comprobar si ya existe el documento
    const usuarioDocumento = await pool.query(
      'SELECT id FROM usuarios WHERE numero_documento = ? LIMIT 1',
      [numero_documento]
    );

    if (usuarioDocumento.length > 0) {
      return res.status(409).json({
        message: 'El número de documento ya está registrado.',
      });
    }

    // Comprobar que el rol exista
    const rol = await pool.query(
      'SELECT id FROM roles WHERE id = ? LIMIT 1',
      [rol_id]
    );

    if (rol.length === 0) {
      return res.status(400).json({
        message: 'El rol especificado no existe.',
      });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const resultado = await pool.query(
      `INSERT INTO usuarios
      (
        nombre,
        apellido,
        tipo_documento,
        numero_documento,
        direccion,
        telefono,
        correo,
        password,
        rol_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        apellido,
        tipo_documento,
        numero_documento,
        direccion,
        telefono,
        correo,
        hashedPassword,
        rol_id,
      ]
    );

    res.status(201).json({
      message: 'Usuario creado correctamente.',
      usuarioId: Number(resultado.insertId),
    });

  } catch (error) {
    console.error('Error al crear usuario:', error);

    res.status(500).json({
      message: 'Error interno del servidor.',
    });
  }
};

const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const usuarios = await pool.query(
      `SELECT
        id,
        nombre,
        apellido,
        tipo_documento,
        numero_documento,
        direccion,
        telefono,
        correo,
        rol_id,
        estado,
        fecha_registro
      FROM usuarios
      WHERE id = ?
      LIMIT 1`,
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        message: 'Usuario no encontrado.',
      });
    }

    res.status(200).json({
      usuario: usuarios[0],
    });

  } catch (error) {
    console.error('Error al obtener usuario:', error);

    res.status(500).json({
      message: 'Error interno del servidor.',
    });
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nombre,
      apellido,
      tipo_documento,
      numero_documento,
      direccion,
      telefono,
      correo,
      password,
      rol_id,
      estado,
    } = req.body;

    // Verificar que el usuario exista
    const usuarios = await pool.query(
      'SELECT * FROM usuarios WHERE id = ? LIMIT 1',
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        message: 'Usuario no encontrado.',
      });
    }

    // Verificar correo duplicado
    const usuarioCorreo = await pool.query(
      `SELECT id
       FROM usuarios
       WHERE correo = ?
       AND id != ?
       LIMIT 1`,
      [correo, id]
    );

    if (usuarioCorreo.length > 0) {
      return res.status(409).json({
        message: 'El correo ya está registrado por otro usuario.',
      });
    }

    // Verificar documento duplicado
    const usuarioDocumento = await pool.query(
      `SELECT id
       FROM usuarios
       WHERE numero_documento = ?
       AND id != ?
       LIMIT 1`,
      [numero_documento, id]
    );

    if (usuarioDocumento.length > 0) {
      return res.status(409).json({
        message: 'El número de documento ya está registrado por otro usuario.',
      });
    }

    // Verificar que el rol exista
    const rol = await pool.query(
      'SELECT id FROM roles WHERE id = ? LIMIT 1',
      [rol_id]
    );

    if (rol.length === 0) {
      return res.status(400).json({
        message: 'El rol especificado no existe.',
      });
    }

    let passwordFinal = usuarios[0].password;

    // Si se envió una nueva contraseña, la hasheamos
    if (password && password.trim() !== '') {
      passwordFinal = await bcrypt.hash(password, 10);
    }

    await pool.query(
      `UPDATE usuarios
       SET
         nombre = ?,
         apellido = ?,
         tipo_documento = ?,
         numero_documento = ?,
         direccion = ?,
         telefono = ?,
         correo = ?,
         password = ?,
         rol_id = ?,
         estado = ?
       WHERE id = ?`,
      [
        nombre,
        apellido,
        tipo_documento,
        numero_documento,
        direccion,
        telefono,
        correo,
        passwordFinal,
        rol_id,
        estado,
        id,
      ]
    );

    res.status(200).json({
      message: 'Usuario actualizado correctamente.',
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);

    res.status(500).json({
      message: 'Error interno del servidor.',
    });
  }
};

const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario exista
    const usuarios = await pool.query(
      'SELECT id FROM usuarios WHERE id = ? LIMIT 1',
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        message: 'Usuario no encontrado.',
      });
    }

    // Evitar que el administrador se elimine a sí mismo
    if (Number(req.usuario.id) === Number(id)) {
      return res.status(400).json({
        message: 'No puedes eliminar tu propio usuario.',
      });
    }

    await pool.query(
      'DELETE FROM usuarios WHERE id = ?',
      [id]
    );

    res.status(200).json({
      message: 'Usuario eliminado correctamente.',
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);

    res.status(500).json({
      message: 'Error interno del servidor.',
    });
  }
};

module.exports = {
  obtenerUsuarios,
  crearUsuario,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
};