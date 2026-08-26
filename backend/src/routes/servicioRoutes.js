const express = require('express');

const {
  obtenerServicios,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
} = require('../controllers/servicioController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();


// ==========================================
// OBTENER SERVICIOS
// PÚBLICO
// ==========================================
//
// Cualquier persona puede consultar los tours.
// No necesita iniciar sesión.
//

router.get(
  '/',
  obtenerServicios
);


// ==========================================
// CREAR SERVICIO
// ADMIN + EMPLEADO
// ==========================================

router.post(
  '/',
  authMiddleware,
  roleMiddleware(1, 2),
  crearServicio
);


// ==========================================
// ACTUALIZAR SERVICIO
// ADMIN + EMPLEADO
// ==========================================

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(1, 2),
  actualizarServicio
);


// ==========================================
// ELIMINAR SERVICIO
// SOLO ADMIN
// ==========================================

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(1),
  eliminarServicio
);


module.exports = router;