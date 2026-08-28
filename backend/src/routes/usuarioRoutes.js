const express = require('express');

const {
  obtenerUsuarios,
  crearUsuario,
  obtenerUsuarioPorId,
  obtenerMiPerfil,
  actualizarMiPerfil,
  actualizarUsuario,
  eliminarUsuario,
} = require('../controllers/usuarioController');

const authMiddleware = require('../middleware/authMiddleware');

const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();


// ==========================================
// ADMIN — USUARIOS
// ==========================================

router.get(
  '/',
  authMiddleware,
  roleMiddleware(1),
  obtenerUsuarios
);


router.post(
  '/',
  authMiddleware,
  roleMiddleware(1),
  crearUsuario
);


// ==========================================
// USUARIO AUTENTICADO — MI PERFIL
// ==========================================

router.get(
  '/me',
  authMiddleware,
  obtenerMiPerfil
);


router.put(
  '/me',
  authMiddleware,
  actualizarMiPerfil
);


// ==========================================
// ADMIN — USUARIO POR ID
// ==========================================

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(1),
  obtenerUsuarioPorId
);


router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(1),
  actualizarUsuario
);


router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(1),
  eliminarUsuario
);


module.exports = router;