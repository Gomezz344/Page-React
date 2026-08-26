const pool = require('../config/database');

const getDashboardStats = async (req, res) => {
  let conn;

  try {
    conn = await pool.getConnection();

    const usuariosResult = await conn.query(`
      SELECT COUNT(*) AS total
      FROM usuarios
    `);

    const productosResult = await conn.query(`
      SELECT COUNT(*) AS total
      FROM productos
    `);

    const serviciosResult = await conn.query(`
      SELECT COUNT(*) AS total
      FROM servicios
    `);

    res.json({
      usuarios: Number(usuariosResult[0].total),
      productos: Number(productosResult[0].total),
      servicios: Number(serviciosResult[0].total)
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);

    res.status(500).json({
      message: 'Error al obtener las estadísticas del dashboard.'
    });

  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  getDashboardStats
};