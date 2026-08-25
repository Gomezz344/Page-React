const pool = require('../config/database');

// Obtener todos los productos
const getProductos = async (req, res) => {
  let conn;

  try {
    conn = await pool.getConnection();

    const productos = await conn.query(`
      SELECT
        id,
        nombre,
        descripcion,
        precio,
        imagen,
        stock,
        estado,
        fecha_creacion
      FROM productos
      ORDER BY id DESC
    `);

    res.json(productos);

  } catch (error) {
    console.error('Error al obtener productos:', error);

    res.status(500).json({
      message: 'Error al obtener los productos.'
    });

  } finally {
    if (conn) conn.release();
  }
};


// Crear producto
const createProducto = async (req, res) => {
  let conn;

  try {
    const {
      nombre,
      descripcion,
      precio,
      imagen,
      stock
    } = req.body;

    // Validaciones básicas
    if (!nombre || precio === undefined || stock === undefined) {
      return res.status(400).json({
        message: 'Nombre, precio y stock son obligatorios.'
      });
    }

    if (precio < 0) {
      return res.status(400).json({
        message: 'El precio no puede ser negativo.'
      });
    }

    if (stock < 0) {
      return res.status(400).json({
        message: 'El stock no puede ser negativo.'
      });
    }

    conn = await pool.getConnection();

    const result = await conn.query(
      `
      INSERT INTO productos
      (
        nombre,
        descripcion,
        precio,
        imagen,
        stock
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        nombre,
        descripcion || null,
        precio,
        imagen || null,
        stock
      ]
    );

    res.status(201).json({
      message: 'Producto creado correctamente.',
      productoId: Number(result.insertId)
    });

  } catch (error) {
    console.error('Error al crear producto:', error);

    res.status(500).json({
      message: 'Error al crear el producto.'
    });

  } finally {
    if (conn) conn.release();
  }
};


// Editar producto
const updateProducto = async (req, res) => {
  let conn;

  try {
    const { id } = req.params;

    const {
      nombre,
      descripcion,
      precio,
      imagen,
      stock,
      estado
    } = req.body;

    if (!nombre || precio === undefined || stock === undefined) {
      return res.status(400).json({
        message: 'Nombre, precio y stock son obligatorios.'
      });
    }

    if (precio < 0) {
      return res.status(400).json({
        message: 'El precio no puede ser negativo.'
      });
    }

    if (stock < 0) {
      return res.status(400).json({
        message: 'El stock no puede ser negativo.'
      });
    }

    conn = await pool.getConnection();

    const result = await conn.query(
      `
      UPDATE productos
      SET
        nombre = ?,
        descripcion = ?,
        precio = ?,
        imagen = ?,
        stock = ?,
        estado = ?
      WHERE id = ?
      `,
      [
        nombre,
        descripcion || null,
        precio,
        imagen || null,
        stock,
        estado === undefined ? 1 : estado,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Producto no encontrado.'
      });
    }

    res.json({
      message: 'Producto actualizado correctamente.'
    });

  } catch (error) {
    console.error('Error al actualizar producto:', error);

    res.status(500).json({
      message: 'Error al actualizar el producto.'
    });

  } finally {
    if (conn) conn.release();
  }
};


// Eliminar producto
const deleteProducto = async (req, res) => {
  let conn;

  try {
    const { id } = req.params;

    conn = await pool.getConnection();

    const result = await conn.query(
      `
      DELETE FROM productos
      WHERE id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Producto no encontrado.'
      });
    }

    res.json({
      message: 'Producto eliminado correctamente.'
    });

  } catch (error) {
    console.error('Error al eliminar producto:', error);

    res.status(500).json({
      message: 'Error al eliminar el producto.'
    });

  } finally {
    if (conn) conn.release();
  }
};

module.exports = {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto
};