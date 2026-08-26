const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const productosRoutes = require('./routes/productoRoutes');
const adminRoutes = require('./routes/adminRoutes');
const servicioRoutes = require('./routes/servicioRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

const app = express();


// ==========================================
// CORS
// ==========================================

app.use(cors({
  origin: 'http://localhost:5173'
}));


// ==========================================
// JSON
// ==========================================

app.use(express.json());


// ==========================================
// RUTA DE PRUEBA
// ==========================================

app.get('/', (req, res) => {

  res.json({
    message: 'Wildlife API funcionando',
  });

});


// ==========================================
// RUTAS
// ==========================================

app.use('/api/auth', authRoutes);

app.use('/api/productos', productosRoutes);

app.use('/api/servicios', servicioRoutes);

app.use('/api/usuarios', usuarioRoutes);

app.use('/api/admin', adminRoutes);


// ==========================================
// EXPORTAR APP
// ==========================================

module.exports = app;