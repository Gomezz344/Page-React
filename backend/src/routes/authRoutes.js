const express = require('express');

const {
  register,
  login,
} = require('../controllers/authcontroller');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.get('/me', authMiddleware, (req, res) => {
  res.json({
    message: 'Ruta protegida funcionando correctamente.',
    usuario: req.usuario,
  });
});

router.get(
  '/admin',
  authMiddleware,
  roleMiddleware(1),
  (req, res) => {
    res.json({
      message: 'Bienvenido administrador.',
      usuario: req.usuario,
    });
  }
);

router.get(
  '/empleado',
  authMiddleware,
  roleMiddleware(1, 2),
  (req, res) => {
    res.json({
      message: 'Bienvenido administrador/empleado.',
      usuario: req.usuario,
    });
  }
);

module.exports = router;