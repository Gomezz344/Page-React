const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const productosRoutes = require('./routes/productoRoutes');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'Wildlife API funcionando',
  });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);

module.exports = app;