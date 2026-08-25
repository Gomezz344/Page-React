const app = require('./app');
const pool = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    const connection = await pool.getConnection();

    console.log('Conexión a MariaDB exitosa');

    connection.release();

    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Error conectando a MariaDB:', error.message);
  }
}

startServer();