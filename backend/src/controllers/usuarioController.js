const bcrypt = require('bcrypt');
const pool = require('../config/database');


// ==========================================
// OBTENER TODOS LOS USUARIOS
// ==========================================

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


// ==========================================
// CREAR USUARIO
// ==========================================

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


    // ==========================================
    // VALIDAR CAMPOS OBLIGATORIOS
    // ==========================================

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


    // ==========================================
    // COMPROBAR CORREO
    // ==========================================

    const usuarioCorreo = await pool.query(
      'SELECT id FROM usuarios WHERE correo = ? LIMIT 1',
      [correo]
    );

    if (usuarioCorreo.length > 0) {

      return res.status(409).json({
        message: 'El correo ya está registrado.',
      });

    }


    // ==========================================
    // COMPROBAR DOCUMENTO
    // ==========================================

    const usuarioDocumento = await pool.query(
      'SELECT id FROM usuarios WHERE numero_documento = ? LIMIT 1',
      [numero_documento]
    );

    if (usuarioDocumento.length > 0) {

      return res.status(409).json({
        message: 'El número de documento ya está registrado.',
      });

    }


    // ==========================================
    // COMPROBAR ROL
    // ==========================================

    const rol = await pool.query(
      'SELECT id FROM roles WHERE id = ? LIMIT 1',
      [rol_id]
    );

    if (rol.length === 0) {

      return res.status(400).json({
        message: 'El rol especificado no existe.',
      });

    }


    // ==========================================
    // HASHEAR CONTRASEÑA
    // ==========================================

    const hashedPassword = await bcrypt.hash(password, 10);


    // ==========================================
    // CREAR USUARIO
    // ==========================================

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


// ==========================================
// OBTENER USUARIO POR ID
// ==========================================

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


// ==========================================
// ACTUALIZAR USUARIO
// ==========================================

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


    // ==========================================
    // BUSCAR USUARIO
    // ==========================================

    const usuarios = await pool.query(
      'SELECT * FROM usuarios WHERE id = ? LIMIT 1',
      [id]
    );


    if (usuarios.length === 0) {

      return res.status(404).json({
        message: 'Usuario no encontrado.',
      });

    }


    const usuarioExistente = usuarios[0];


    // ==========================================
    // PROTECCIÓN DEL PROPIO ADMINISTRADOR
    // ==========================================

    const esUsuarioActual =
      Number(req.usuario.id) === Number(id);


    if (esUsuarioActual) {

      // ------------------------------------------
      // PROTECCIÓN 1:
      // NO PUEDE CAMBIAR SU PROPIO ROL
      // ------------------------------------------

      if (Number(rol_id) !== Number(usuarioExistente.rol_id)) {

        return res.status(400).json({
          message: 'No puedes cambiar tu propio rol.',
        });

      }


      // ------------------------------------------
      // PROTECCIÓN 2:
      // NO PUEDE DESACTIVARSE
      // ------------------------------------------

      if (Number(estado) !== Number(usuarioExistente.estado)) {

        return res.status(400).json({
          message: 'No puedes cambiar el estado de tu propio usuario.',
        });

      }

    }


    // ==========================================
    // COMPROBAR CORREO DUPLICADO
    // ==========================================

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


    // ==========================================
    // COMPROBAR DOCUMENTO DUPLICADO
    // ==========================================

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
        message:
          'El número de documento ya está registrado por otro usuario.',
      });

    }


    // ==========================================
    // COMPROBAR ROL
    // ==========================================

    const rol = await pool.query(
      'SELECT id FROM roles WHERE id = ? LIMIT 1',
      [rol_id]
    );


    if (rol.length === 0) {

      return res.status(400).json({
        message: 'El rol especificado no existe.',
      });

    }


    // ==========================================
    // CONTRASEÑA
    // ==========================================

    let passwordFinal = usuarioExistente.password;


    if (
      password &&
      typeof password === 'string' &&
      password.trim() !== ''
    ) {

      passwordFinal = await bcrypt.hash(password, 10);

    }


    // ==========================================
    // ACTUALIZAR USUARIO
    // ==========================================

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

// ==========================================
// OBTENER MI PERFIL
// ==========================================

const obtenerMiPerfil = async (req, res) => {
  try {

    const { id } = req.usuario;

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

    console.error(
      'Error al obtener mi perfil:',
      error
    );

    res.status(500).json({
      message: 'Error interno del servidor.',
    });

  }
};

// ==========================================
// ACTUALIZAR MI PERFIL
// ==========================================

const actualizarMiPerfil = async (req, res) => {
  try {

    const { id } = req.usuario;

    const {
      nombre,
      apellido,
      direccion,
      telefono,
      correo,
    } = req.body;


    // ==========================================
    // VALIDAR CAMPOS
    // ==========================================

    if (
      !nombre ||
      !apellido ||
      !direccion ||
      !telefono ||
      !correo
    ) {

      return res.status(400).json({
        message: 'Todos los campos son obligatorios.',
      });

    }


    // ==========================================
    // COMPROBAR CORREO DUPLICADO
    // ==========================================

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


    // ==========================================
    // ACTUALIZAR
    // ==========================================

    await pool.query(
      `UPDATE usuarios
       SET
         nombre = ?,
         apellido = ?,
         direccion = ?,
         telefono = ?,
         correo = ?
       WHERE id = ?`,
      [
        nombre,
        apellido,
        direccion,
        telefono,
        correo,
        id,
      ]
    );


    // ==========================================
    // OBTENER DATOS ACTUALIZADOS
    // ==========================================

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


    res.status(200).json({
      message: 'Perfil actualizado correctamente.',
      usuario: usuarios[0],
    });

  } catch (error) {

    console.error(
      'Error al actualizar mi perfil:',
      error
    );

    res.status(500).json({
      message: 'Error interno del servidor.',
    });

  }
};


// ==========================================
// ELIMINAR USUARIO
// ==========================================

const eliminarUsuario = async (req, res) => {
  try {

    const { id } = req.params;


    // ==========================================
    // BUSCAR USUARIO
    // ==========================================

    const usuarios = await pool.query(
      'SELECT id, rol_id FROM usuarios WHERE id = ? LIMIT 1',
      [id]
    );


    if (usuarios.length === 0) {

      return res.status(404).json({
        message: 'Usuario no encontrado.',
      });

    }


    // ==========================================
    // PROTECCIÓN 3:
    // NO PUEDE ELIMINARSE A SÍ MISMO
    // ==========================================

    if (Number(req.usuario.id) === Number(id)) {

      return res.status(400).json({
        message: 'No puedes eliminar tu propio usuario.',
      });

    }


    // ==========================================
    // ELIMINAR
    // ==========================================

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


// ==========================================
// EXPORTAR
// ==========================================

module.exports = {
  obtenerUsuarios,
  crearUsuario,
  obtenerUsuarioPorId,
  actualizarUsuario,
  obtenerMiPerfil,
  actualizarMiPerfil,
  actualizarUsuario,
  eliminarUsuario,
};