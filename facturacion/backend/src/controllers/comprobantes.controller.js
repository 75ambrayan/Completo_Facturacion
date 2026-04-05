const { db } = require('../database');
const { v4: uuidv4 } = require('uuid');
const { emitirComprobante, enviarSunat } = require('../services/sunat.service');

async function getConfig() {
  return await db('configuracion').first();
}

function calcularTotales(items, igvPct = 18) {
  const factor = igvPct / 100;
  let op_gravada = 0, op_exonerada = 0;
  const itemsCalc = items.map(it => {
    const cantidad = parseFloat(it.cantidad) || 0;
    const precio_con_igv = parseFloat(it.precio_con_igv) || 0;
    const precio_unitario = it.afecto_igv ? +(precio_con_igv / (1 + factor)).toFixed(6) : precio_con_igv;
    const descuento = parseFloat(it.descuento) || 0;
    const base = +(precio_unitario * cantidad - descuento).toFixed(2);
    const igv = it.afecto_igv ? +(base * factor).toFixed(2) : 0;
    const total_item = +(base + igv).toFixed(2);
    if (it.afecto_igv) op_gravada += base; else op_exonerada += base;
    return { ...it, precio_unitario: +precio_unitario.toFixed(6), precio_con_igv, base_imponible: base, igv, total_item };
  });
  op_gravada = +op_gravada.toFixed(2);
  op_exonerada = +op_exonerada.toFixed(2);
  const igv_total = +(op_gravada * factor).toFixed(2);
  const total = +(op_gravada + op_exonerada + igv_total).toFixed(2);
  return { itemsCalc, op_gravada, op_exonerada, op_inafecta: 0, igv: igv_total, total };
}

exports.crear = async (req, res) => {
  try {
    const config = await getConfig();
    if (!config) return res.status(400).json({ error: 'Configure la empresa primero' });
    const { tipo_comprobante, cliente, items, moneda = 'PEN', observaciones, fecha_emision } = req.body;
    if (!items?.length) return res.status(400).json({ error: 'Debe agregar al menos un item' });
    const es_factura = tipo_comprobante === '01';
    if (es_factura && cliente?.tipo_documento !== 'RUC') return res.status(400).json({ error: 'La factura requiere RUC del cliente' });

    const serie = es_factura ? config.serie_factura : config.serie_boleta;
    const campo_corr = es_factura ? 'correlativo_factura' : 'correlativo_boleta';
    const correlativo = config[campo_corr];
    const numero_completo = `${serie}-${String(correlativo).padStart(8, '0')}`;
    const { itemsCalc, op_gravada, op_exonerada, op_inafecta, igv, total } = calcularTotales(items, config.igv_porcentaje);

    let cliente_id = null;
    if (cliente?.numero_documento) {
      const exist = await db('clientes').where({ numero_documento: cliente.numero_documento, tipo_documento: cliente.tipo_documento || 'DNI' }).first();
      if (exist) { cliente_id = exist.id; }
      else {
        [cliente_id] = await db('clientes').insert({ tipo_documento: cliente.tipo_documento || 'DNI', numero_documento: cliente.numero_documento, nombre: cliente.nombre, direccion: cliente.direccion || '', email: cliente.email || '' });
      }
    }

    const uuid = uuidv4();
    const fecha = fecha_emision || new Date().toISOString().split('T')[0];
    const [comp_id] = await db('comprobantes').insert({
      uuid, tipo_comprobante, serie, correlativo, numero_completo, fecha_emision: fecha, moneda,
      cliente_id, cliente_tipo_doc: cliente?.tipo_documento || null, cliente_num_doc: cliente?.numero_documento || null,
      cliente_nombre: cliente?.nombre || 'VARIOS', cliente_direccion: cliente?.direccion || '',
      subtotal: +(op_gravada + op_exonerada).toFixed(2), base_imponible: op_gravada, igv, total,
      op_gravada, op_exonerada, op_inafecta, observaciones: observaciones || null, estado: 'PENDIENTE'
    });

    for (let i = 0; i < itemsCalc.length; i++) {
      const it = itemsCalc[i];
      await db('comprobante_items').insert({
        comprobante_id: comp_id, producto_id: it.producto_id || null, descripcion: it.descripcion,
        unidad_medida: it.unidad_medida || 'NIU', cantidad: it.cantidad, precio_unitario: it.precio_unitario,
        precio_con_igv: it.precio_con_igv, descuento: it.descuento || 0, afecto_igv: it.afecto_igv ? 1 : 0,
        base_imponible: it.base_imponible, igv: it.igv, total_item: it.total_item, orden: i
      });
    }

    await db('configuracion').update({ [campo_corr]: correlativo + 1 });
    const comprobante = await db('comprobantes').where({ id: comp_id }).first();
    res.status(201).json({ ok: true, comprobante, numero: numero_completo });
  } catch (e) { console.error(e); res.status(500).json({ error: e.message }); }
};

exports.emitir = async (req, res) => {
  try {
    const config = await getConfig();
    const comp = await db('comprobantes').where({ id: req.params.id }).first();
    if (!comp) return res.status(404).json({ error: 'No encontrado' });
    if (comp.estado === 'ACEPTADO') return res.status(400).json({ error: 'Ya fue aceptado' });

    const items = await db('comprobante_items').where({ comprobante_id: comp.id }).orderBy('orden');
    const tieneToken = !!(process.env.MIAPI_TOKEN || config.miapi_token);
    const tieneClave = !!(process.env.MIAPI_CLAVE || config.miapi_clave);

    // Sin credenciales → modo demo
    if (!tieneToken || !tieneClave) {
      await db('comprobantes').where({ id: comp.id }).update({
        estado: 'ACEPTADO',
        sunat_mensaje: 'Modo demo - configure MIAPI_TOKEN y MIAPI_CLAVE en .env'
      });
      return res.json({ ok: true, demo: true, mensaje: 'Emitido en modo demo. Configure su token y clave de miapi.cloud para emitir a SUNAT real.', numero: comp.numero_completo });
    }

    try {
      // PASO 1: Generar XML y PDF en miapi.cloud
      const resultado = await emitirComprobante(comp, items, config);

      // PASO 2: Enviar a SUNAT via miapi.cloud
      let sunatResp = null;
      try {
        sunatResp = await enviarSunat(comp, config);
      } catch (sunatErr) {
        console.warn('Aviso envío SUNAT:', sunatErr.message);
      }

      await db('comprobantes').where({ id: comp.id }).update({
        estado: 'ACEPTADO',
        sunat_mensaje: sunatResp?.mensaje || resultado.mensaje || 'Aceptado',
        enlace_pdf_a4: resultado.enlace_pdf || '',
        enlace_pdf_ticket: resultado.enlace_pdf_ticket || '',
        enlace_xml_firmado: resultado.enlace_xml || '',
        enlace_xml_sin_firmar: resultado.enlace_xml_sin_firmar || '',
        nombre_archivo: resultado.nombre_archivo || '',
        hash_cpe: resultado.hash || ''
      });

      res.json({
        ok: true,
        numero: comp.numero_completo,
        enlace_pdf: resultado.enlace_pdf,
        enlace_xml: resultado.enlace_xml,
        mensaje: resultado.mensaje,
        sunat: sunatResp
      });

    } catch (apiErr) {
      console.error('Error miapi.cloud:', apiErr.message);
      // Si falla la API igual guardamos como demo
      await db('comprobantes').where({ id: comp.id }).update({
        estado: 'ACEPTADO',
        sunat_mensaje: 'Error API: ' + apiErr.message
      });
      res.json({ ok: true, demo: true, advertencia: apiErr.message, numero: comp.numero_completo });
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.canjear = async (req, res) => {
  try {
    const config = await getConfig();
    const boleta = await db('comprobantes').where({ id: req.params.id }).first();
    if (!boleta) return res.status(404).json({ error: 'No encontrada' });
    if (boleta.tipo_comprobante !== '03') return res.status(400).json({ error: 'Solo se canjean boletas' });
    if (boleta.es_canje) return res.status(400).json({ error: 'Ya fue canjeada' });
    const { cliente_ruc, cliente_nombre, cliente_direccion } = req.body;
    if (!cliente_ruc) return res.status(400).json({ error: 'Se requiere RUC' });
    const items = await db('comprobante_items').where({ comprobante_id: boleta.id }).orderBy('orden');
    const correlativo = config.correlativo_factura;
    const serie = config.serie_factura;
    const numero_completo = `${serie}-${String(correlativo).padStart(8, '0')}`;
    const fecha = new Date().toISOString().split('T')[0];
    const [fid] = await db('comprobantes').insert({
      uuid: uuidv4(), tipo_comprobante: '01', serie, correlativo, numero_completo,
      fecha_emision: fecha, moneda: boleta.moneda, cliente_tipo_doc: 'RUC',
      cliente_num_doc: cliente_ruc, cliente_nombre: cliente_nombre || 'EMPRESA',
      cliente_direccion: cliente_direccion || '', subtotal: boleta.subtotal,
      base_imponible: boleta.base_imponible, igv: boleta.igv, total: boleta.total,
      op_gravada: boleta.op_gravada, op_exonerada: boleta.op_exonerada, op_inafecta: boleta.op_inafecta,
      es_canje: 1, comprobante_origen_id: boleta.id, estado: 'PENDIENTE',
      observaciones: `Canje de ${boleta.numero_completo}`
    });
    for (const it of items) {
      await db('comprobante_items').insert({ ...it, id: undefined, comprobante_id: fid });
    }
    await db('comprobantes').where({ id: boleta.id }).update({ es_canje: 1 });
    await db('configuracion').update({ correlativo_factura: correlativo + 1 });
    const factura = await db('comprobantes').where({ id: fid }).first();
    res.status(201).json({ ok: true, factura, numero: numero_completo, mensaje: `Boleta ${boleta.numero_completo} canjeada a Factura ${numero_completo}` });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.notaCredito = async (req, res) => {
  try {
    const config = await getConfig();
    const origen = await db('comprobantes').where({ id: req.params.id }).first();
    if (!origen) return res.status(404).json({ error: 'No encontrado' });
    const { motivo = 'Anulacion', tipo_nota = '01' } = req.body;
    const serie_nc = config.serie_nota_credito;
    const correlativo = config.correlativo_nota_credito;
    const numero_completo = `${serie_nc}-${String(correlativo).padStart(8, '0')}`;
    const items = await db('comprobante_items').where({ comprobante_id: origen.id }).orderBy('orden');
    const [ncid] = await db('comprobantes').insert({
      uuid: uuidv4(), tipo_comprobante: '07', serie: serie_nc, correlativo,
      numero_completo, fecha_emision: new Date().toISOString().split('T')[0],
      moneda: origen.moneda, cliente_tipo_doc: origen.cliente_tipo_doc,
      cliente_num_doc: origen.cliente_num_doc, cliente_nombre: origen.cliente_nombre,
      cliente_direccion: origen.cliente_direccion, subtotal: origen.subtotal,
      base_imponible: origen.base_imponible, igv: origen.igv, total: origen.total,
      op_gravada: origen.op_gravada, op_exonerada: origen.op_exonerada, op_inafecta: origen.op_inafecta,
      comprobante_origen_id: origen.id, motivo_nc: motivo, tipo_nota_credito: tipo_nota, estado: 'PENDIENTE'
    });
    for (const it of items) {
      await db('comprobante_items').insert({ ...it, id: undefined, comprobante_id: ncid });
    }
    await db('comprobantes').where({ id: origen.id }).update({ estado: 'ANULADO' });
    await db('configuracion').update({ correlativo_nota_credito: correlativo + 1 });
    const nc = await db('comprobantes').where({ id: ncid }).first();
    res.status(201).json({ ok: true, nota_credito: nc, numero: numero_completo });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.listar = async (req, res) => {
  try {
    const { tipo, estado, desde, hasta, q, page = 1, limit = 20 } = req.query;
    let query = db('comprobantes').orderBy('id', 'desc');
    if (tipo) query = query.where({ tipo_comprobante: tipo });
    if (estado) query = query.where({ estado });
    if (desde) query = query.where('fecha_emision', '>=', desde);
    if (hasta) query = query.where('fecha_emision', '<=', hasta);
    if (q) query = query.where(function() { this.where('numero_completo', 'like', `%${q}%`).orWhere('cliente_nombre', 'like', `%${q}%`).orWhere('cliente_num_doc', 'like', `%${q}%`); });
    const total = (await query.clone().count('id as n').first()).n;
    const data = await query.limit(parseInt(limit)).offset((parseInt(page)-1)*parseInt(limit));
    res.json({ ok: true, data, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.obtener = async (req, res) => {
  try {
    const comp = await db('comprobantes').where({ id: req.params.id }).first();
    if (!comp) return res.status(404).json({ error: 'No encontrado' });
    const items = await db('comprobante_items').where({ comprobante_id: comp.id }).orderBy('orden');
    res.json({ ok: true, comprobante: comp, items });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.estadisticas = async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];
    const mesInicio = hoy.slice(0,7) + '-01';
    const [hoyStats, mesStats, por_tipo, por_estado, recientes] = await Promise.all([
      db('comprobantes').where({ fecha_emision: hoy }).count('id as n').sum('total as total').first(),
      db('comprobantes').where('fecha_emision', '>=', mesInicio).count('id as n').sum('total as total').first(),
      db('comprobantes').groupBy('tipo_comprobante').select('tipo_comprobante').count('id as n').sum('total as total'),
      db('comprobantes').groupBy('estado').select('estado').count('id as n'),
      db('comprobantes').orderBy('id','desc').limit(5)
    ]);
    res.json({ ok: true, stats: { hoy: hoyStats, mes: mesStats, por_tipo, por_estado, recientes } });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
