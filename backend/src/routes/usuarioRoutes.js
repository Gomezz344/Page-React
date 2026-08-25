const express = require('express');

const {
  obtenerUsuarios,
  crearUsuario,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
} = require('../controllers/usuarioController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

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