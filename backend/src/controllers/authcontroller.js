const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const register = async (req, res) => {
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
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
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
        3,
      ]
    );

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      usuarioId: Number(result.insertId),
    });

  } catch (error) {
    console.error('Error al registrar usuario:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'El correo o número de documento ya está registrado.',
      });
    }

    res.status(500).json({
      message: 'Error interno del servidor.',
    });
  }
};


const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        message: 'Correo y contraseña son obligatorios.',
      });
    }

    const usuarios = await pool.query(
      `SELECT
        id,
        nombre,
        apellido,
        correo,
        password,
        rol_id,
        estado
      FROM usuarios
      WHERE correo = ?
      LIMIT 1`,
      [correo]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({
        message: 'Correo o contraseña incorrectos.',
      });
    }

    const usuario = usuarios[0];

    if (!usuario.estado) {
      return res.status(403).json({
        message: 'La cuenta está desactivada.',
      });
    }

    const passwordCorrecta = await bcrypt.compare(
      password,
      usuario.password
    );

    if (!passwordCorrecta) {
      return res.status(401).json({
        message: 'Correo o contraseña incorrectos.',
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        rol_id: usuario.rol_id,
        correo: usuario.correo,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      }
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        rol_id: usuario.rol_id,
      },
    });

  } catch (error) {
    console.error('Error al iniciar sesión:', error);

    res.status(500).json({
      message: 'Error interno del servidor.',
    });
  }
};


module.exports = {
  register,
  login,
};