const db = require('../config/database');


// ==========================================
// OBTENER SERVICIOS
// ==========================================

const obtenerServicios = async (req, res) => {

  try {

    const servicios = await db.query(
      'SELECT * FROM servicios ORDER BY id DESC'
    );

    res.json(servicios);

  } catch (error) {

    console.error(
      'Error al obtener servicios:',
      error
    );

    res.status(500).json({
      message: 'Error al obtener los servicios.',
    });

  }

};


// ==========================================
// CREAR SERVICIO
// ==========================================

const crearServicio = async (req, res) => {

  try {

    const {
      nombre,
      descripcion,
      precio,
      duracion,
      imagen,
      estado,
    } = req.body;


    // ==========================================
    // VALIDACIONES
    // ==========================================

    if (
      !nombre ||
      precio === undefined ||
      precio === null
    ) {

      return res.status(400).json({
        message: 'Nombre y precio son obligatorios.',
      });

    }


    // ==========================================
    // INSERTAR SERVICIO
    // ==========================================

    const resultado = await db.query(
      `
      INSERT INTO servicios
      (
        nombre,
        descripcion,
        precio,
        duracion,
        imagen,
        estado
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        nombre,
        descripcion || null,
        Number(precio),
        duracion || null,
        imagen || null,
        estado !== undefined
          ? Number(estado)
          : 1,
      ]
    );


    // ==========================================
    // RESPUESTA
    // ==========================================

    res.status(201).json({

      message: 'Servicio creado correctamente.',

      id: Number(resultado.insertId),

    });

  } catch (error) {

    console.error(
      'Error al crear servicio:',
      error
    );

    res.status(500).json({
      message: 'Error al crear el servicio.',
    });

  }

};


// ==========================================
// ACTUALIZAR SERVICIO
// ==========================================

const actualizarServicio = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      nombre,
      descripcion,
      precio,
      duracion,
      imagen,
      estado,
    } = req.body;


    // ==========================================
    // VALIDACIONES
    // ==========================================

    if (
      !nombre ||
      precio === undefined ||
      precio === null
    ) {

      return res.status(400).json({
        message: 'Nombre y precio son obligatorios.',
      });

    }


    // ==========================================
    // ACTUALIZAR
    // ==========================================

    const resultado = await db.query(
      `
      UPDATE servicios
      SET
        nombre = ?,
        descripcion = ?,
        precio = ?,
        duracion = ?,
        imagen = ?,
        estado = ?
      WHERE id = ?
      `,
      [
        nombre,
        descripcion || null,
        Number(precio),
        duracion || null,
        imagen || null,
        estado !== undefined
          ? Number(estado)
          : 1,
        id,
      ]
    );


    // ==========================================
    // VERIFICAR EXISTENCIA
    // ==========================================

    if (resultado.affectedRows === 0) {

      return res.status(404).json({
        message: 'Servicio no encontrado.',
      });

    }


    res.json({
      message: 'Servicio actualizado correctamente.',
    });

  } catch (error) {

    console.error(
      'Error al actualizar servicio:',
      error
    );

    res.status(500).json({
      message: 'Error al actualizar el servicio.',
    });

  }

};


// ==========================================
// ELIMINAR SERVICIO
// ==========================================

const eliminarServicio = async (req, res) => {

  try {

    const { id } = req.params;


    const resultado = await db.query(
      'DELETE FROM servicios WHERE id = ?',
      [id]
    );


    if (resultado.affectedRows === 0) {

      return res.status(404).json({
        message: 'Servicio no encontrado.',
      });

    }


    res.json({
      message: 'Servicio eliminado correctamente.',
    });

  } catch (error) {

    console.error(
      'Error al eliminar servicio:',
      error
    );

    res.status(500).json({
      message: 'Error al eliminar el servicio.',
    });

  }

};


// ==========================================
// EXPORTAR
// ==========================================

module.exports = {
  obtenerServicios,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
};