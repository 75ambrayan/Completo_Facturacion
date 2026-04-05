const { db } = require('../database');

exports.categorias = {
  listar: async (req, res) => {
    try {
      const rows = await db('categorias as c').leftJoin('productos as p', 'p.categoria_id', 'c.id').groupBy('c.id').select('c.*').count('p.id as num_productos').orderBy('c.nombre');
      res.json({ ok: true, data: rows });
    } catch (e) { res.status(500).json({ error: e.message }); }
  },
  crear: async (req, res) => {
    try {
      const { nombre, descripcion } = req.body;
      if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });
      const [id] = await db('categorias').insert({ nombre, descripcion: descripcion || null });
      res.status(201).json({ ok: true, id });
    } catch (e) { res.status(400).json({ error: 'Nombre ya existe' }); }
  },
  actualizar: async (req, res) => {
    try {
      const { nombre, descripcion, activo } = req.body;
      await db('categorias').where({ id: req.params.id }).update({ nombre, descripcion, activo: activo ?? 1 });
      res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
  },
  eliminar: async (req, res) => {
    try {
      await db('categorias').where({ id: req.params.id }).update({ activo: 0 });
      res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
  }
};

exports.productos = {
  listar: async (req, res) => {
    try {
      const { q, categoria_id, activo = 1 } = req.query;
      let query = db('productos as p').leftJoin('categorias as c', 'c.id', 'p.categoria_id').select('p.*', 'c.nombre as categoria_nombre').where('p.activo', parseInt(activo)).orderBy('p.nombre');
      if (q) query = query.where(function() { this.where('p.nombre', 'like', `%${q}%`).orWhere('p.codigo', 'like', `%${q}%`); });
      if (categoria_id) query = query.where('p.categoria_id', categoria_id);
      res.json({ ok: true, data: await query });
    } catch (e) { res.status(500).json({ error: e.message }); }
  },
  obtener: async (req, res) => {
    try {
      const p = await db('productos as p').leftJoin('categorias as c', 'c.id', 'p.categoria_id').select('p.*', 'c.nombre as categoria_nombre').where('p.id', req.params.id).first();
      if (!p) return res.status(404).json({ error: 'No encontrado' });
      res.json({ ok: true, data: p });
    } catch (e) { res.status(500).json({ error: e.message }); }
  },
  crear: async (req, res) => {
    try {
      const { codigo, nombre, descripcion, categoria_id, tipo = 'producto', unidad_medida = 'NIU', precio_unitario, precio_con_igv, afecto_igv = 1, stock = 0, stock_minimo = 0 } = req.body;
      if (!nombre || !precio_unitario) return res.status(400).json({ error: 'Nombre y precio requeridos' });
      const pConIgv = precio_con_igv || +(precio_unitario * 1.18).toFixed(2);
      const [id] = await db('productos').insert({ codigo: codigo || null, nombre, descripcion: descripcion || null, categoria_id: categoria_id || null, tipo, unidad_medida, precio_unitario: +precio_unitario, precio_con_igv: +pConIgv, afecto_igv: afecto_igv ? 1 : 0, stock: +stock, stock_minimo: +stock_minimo });
      res.status(201).json({ ok: true, id });
    } catch (e) { res.status(400).json({ error: e.message }); }
  },
  actualizar: async (req, res) => {
    try {
      const { nombre, descripcion, categoria_id, tipo, unidad_medida, precio_unitario, precio_con_igv, afecto_igv, stock, stock_minimo, activo } = req.body;
      await db('productos').where({ id: req.params.id }).update({ nombre, descripcion: descripcion || null, categoria_id: categoria_id || null, tipo: tipo || 'producto', unidad_medida: unidad_medida || 'NIU', precio_unitario: +precio_unitario, precio_con_igv: +precio_con_igv, afecto_igv: afecto_igv ? 1 : 0, stock: +stock, stock_minimo: +stock_minimo, activo: activo ?? 1 });
      res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
  },
  eliminar: async (req, res) => {
    try {
      await db('productos').where({ id: req.params.id }).update({ activo: 0 });
      res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
  }
};

exports.clientes = {
  listar: async (req, res) => {
    try {
      const { q } = req.query;
      let query = db('clientes').where({ activo: 1 }).orderBy('nombre').limit(50);
      if (q) query = query.where(function() { this.where('nombre', 'like', `%${q}%`).orWhere('numero_documento', 'like', `%${q}%`); });
      res.json({ ok: true, data: await query });
    } catch (e) { res.status(500).json({ error: e.message }); }
  },
  crear: async (req, res) => {
    try {
      const { tipo_documento = 'DNI', numero_documento, nombre, direccion, email, telefono } = req.body;
      const [id] = await db('clientes').insert({ tipo_documento, numero_documento, nombre, direccion: direccion || '', email: email || '', telefono: telefono || '' });
      res.status(201).json({ ok: true, id });
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
};

exports.configuracion = {
  obtener: async (req, res) => {
    try {
      const c = await db('configuracion').first();
      res.json({ ok: true, data: c });
    } catch (e) { res.status(500).json({ error: e.message }); }
  },
  guardar: async (req, res) => {
    try {
      const cfg = req.body;
      const exist = await db('configuracion').first();
      if (exist) {
        await db('configuracion').where({ id: exist.id }).update({ ...cfg, id: undefined });
      } else {
        await db('configuracion').insert(cfg);
      }
      res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
  }
};
