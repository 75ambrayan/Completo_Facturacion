const axios = require('axios');

// ─── CONSULTA DNI ─────────────────────────────────────────────────────────────
async function consultarDNI(dni) {
  const token = process.env.MIAPI_TOKEN;
  const APIs = [
    async () => {
      if (!token) throw new Error('sin token');
      const r = await axios.get(`https://miapi.cloud/v1/dni/${dni}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        timeout: 6000
      });
      if (!r.data?.success || !r.data?.datos) throw new Error('Sin datos');
      const d = r.data.datos;
      return {
        numero: dni,
        nombre: `${d.nombres||''} ${d.ape_paterno||''} ${d.ape_materno||''}`.trim(),
        nombres: d.nombres || '',
        apellido_paterno: d.ape_paterno || '',
        apellido_materno: d.ape_materno || '',
        direccion: d.domiciliado?.direccion || '',
        distrito: d.domiciliado?.distrito || '',
        fuente: 'miapi.cloud'
      };
    }
  ];
  for (const api of APIs) {
    try { return await api(); } catch (_) {}
  }
  return { numero: dni, nombre: 'CLIENTE DEMO (configure MIAPI_TOKEN)', fuente: 'demo', demo: true };
}

// ─── CONSULTA RUC ─────────────────────────────────────────────────────────────
async function consultarRUC(ruc) {
  const token = process.env.MIAPI_TOKEN;
  const APIs = [
    async () => {
      if (!token) throw new Error('sin token');
      const r = await axios.get(`https://miapi.cloud/v1/ruc/${ruc}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        timeout: 6000
      });
      if (!r.data?.success || !r.data?.datos) throw new Error('Sin datos');
      const d = r.data.datos;
      return {
        numero: ruc,
        razon_social: d.razon_social || '',
        nombre: d.razon_social || '',
        nombre_comercial: d.nombre_comercial || '',
        direccion: d.ubicacion?.direccion || '',
        distrito: d.ubicacion?.distrito || '',
        departamento: d.ubicacion?.departamento || '',
        estado: d.estado || '',
        condicion: d.condicion || '',
        fuente: 'miapi.cloud'
      };
    }
  ];
  for (const api of APIs) {
    try { return await api(); } catch (_) {}
  }
  return { numero: ruc, nombre: 'EMPRESA DEMO', razon_social: 'EMPRESA DEMO SAC', fuente: 'demo', demo: true };
}

// ─── NÚMERO EN LETRAS ─────────────────────────────────────────────────────────
function numeroALetras(num) {
  const unidades = ['','UNO','DOS','TRES','CUATRO','CINCO','SEIS','SIETE','OCHO','NUEVE','DIEZ','ONCE','DOCE','TRECE','CATORCE','QUINCE','DIECISÉIS','DIECISIETE','DIECIOCHO','DIECINUEVE'];
  const decenas = ['','DIEZ','VEINTE','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'];
  const centenas = ['','CIENTO','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS','SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];
  const entero = Math.floor(num);
  const decimal = Math.round((num - entero) * 100);
  const partes = [];
  if (entero === 0) partes.push('CERO');
  if (entero >= 1000) { partes.push(entero >= 2000 ? unidades[Math.floor(entero/1000)] + ' MIL' : 'MIL'); }
  const cientos = Math.floor((entero % 1000) / 100);
  const resto = entero % 100;
  if (cientos) partes.push(cientos === 1 && resto === 0 ? 'CIEN' : centenas[cientos]);
  if (resto < 20) { if (resto > 0) partes.push(unidades[resto]); }
  else { partes.push(decenas[Math.floor(resto/10)] + (resto%10 ? ' Y ' + unidades[resto%10] : '')); }
  return `${partes.join(' ')} CON ${String(decimal).padStart(2,'0')}/100 SOLES`;
}

// ─── EMITIR COMPROBANTE via miapi.cloud ───────────────────────────────────────
async function emitirComprobante(comprobante, items, config) {
  const token       = process.env.MIAPI_TOKEN || config.miapi_token;
  const claveSecreta = process.env.MIAPI_CLAVE || config.miapi_clave;
  const rucEmisor   = config.ruc || process.env.MIAPI_RUC;

  if (!token || !claveSecreta) throw new Error('Configure MIAPI_TOKEN y MIAPI_CLAVE en .env');

  const esBoleta  = comprobante.tipo_comprobante === '03';
  const esFactura = comprobante.tipo_comprobante === '01';
  const esNC      = comprobante.tipo_comprobante === '07';

  const igvPct = config.igv_porcentaje || 18;
  const factor = igvPct / 100;

  // Totales
  const mtoOperGravadas = comprobante.op_gravada || 0;
  const mtoIGV          = comprobante.igv || 0;
  const total           = comprobante.total || 0;
  const totalTexto      = numeroALetras(total);

  // Items
  const itemsMiapi = items.map((it, i) => ({
    codProducto: it.codigo || `PROD${String(i+1).padStart(3,'0')}`,
    descripcion: it.descripcion,
    unidad: it.unidad_medida || 'NIU',
    tipoPrecio: '01',
    cantidad: it.cantidad,
    mtoBaseIgv: it.base_imponible,
    mtoValorUnitario: it.precio_unitario,
    mtoPrecioUnitario: it.precio_con_igv,
    codeAfectAlt: it.afecto_igv ? 10 : 30,
    codeAfect: it.afecto_igv ? 1000 : 9998,
    nameAfect: it.afecto_igv ? 'IGV' : 'EXO',
    tipoAfect: it.afecto_igv ? 'VAT' : 'FRE',
    igvPorcent: igvPct,
    igv: it.igv,
    igvOpi: it.igv
  }));

  // Cliente
  const tipoDocCliente = comprobante.cliente_tipo_doc === 'RUC' ? '6' :
                         comprobante.cliente_tipo_doc === 'DNI' ? '1' : '0';

  const payload = {
    claveSecreta,
    comprobante: {
      tipoOperacion: '0101',
      tipoDoc: comprobante.tipo_comprobante,
      serie: comprobante.serie,
      correlativo: String(comprobante.correlativo),
      fechaEmision: comprobante.fecha_emision,
      horaEmision: new Date().toTimeString().slice(0,8),
      tipoMoneda: comprobante.moneda || 'PEN',
      tipoPago: 'Contado',
      total: total,
      mtoIGV: mtoIGV,
      igvOp: 0,
      mtoOperGravadas,
      totalTexto
    },
    cliente: {
      codigoPais: 'PE',
      tipoDoc: tipoDocCliente,
      numDoc: comprobante.cliente_num_doc || '00000000',
      rznSocial: comprobante.cliente_nombre || 'CLIENTE VARIOS',
      direccion: comprobante.cliente_direccion || ''
    },
    items: itemsMiapi
  };

  // Para nota de crédito agregar referencia
  if (esNC && comprobante.comprobante_origen_id) {
    payload.comprobante.tipoDoc = '07';
    payload.comprobante.tipDocAfectado = comprobante.tipo_comprobante_origen || '01';
    payload.comprobante.numDocAfectado = comprobante.numero_origen || '';
    payload.comprobante.codMotivo = comprobante.tipo_nota_credito || '01';
    payload.comprobante.desMotivo = comprobante.motivo_nc || 'Anulacion';
  }

  const resp = await axios.post('https://miapi.cloud/apifact/invoice/create', payload, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    timeout: 30000
  });

  const data = resp.data?.respuesta || resp.data;
  if (!data?.success && data?.success !== undefined) {
    throw new Error(data?.mensaje || 'Error al generar comprobante');
  }

  return {
    ok: true,
    enlace_pdf: data['pdf-a4'] || data.pdf || '',
    enlace_pdf_ticket: data['pdf-ticket'] || '',
    enlace_xml: data['xml-firmado'] || data['xml-sin-firmar'] || '',
    enlace_xml_sin_firmar: data['xml-sin-firmar'] || '',
    mensaje: data?.mensaje || 'Comprobante generado',
    nombre_archivo: data?.mensaje?.replace('Documento ','')?.replace(' creado con éxito','') || '',
    raw: data
  };
}

// ─── ENVIAR A SUNAT via miapi.cloud ───────────────────────────────────────────
async function enviarSunat(comprobante, config) {
  const token        = process.env.MIAPI_TOKEN || config.miapi_token;
  const claveSecreta = process.env.MIAPI_CLAVE || config.miapi_clave;

  if (!token || !claveSecreta) throw new Error('Configure MIAPI_TOKEN y MIAPI_CLAVE');

  const tipoDoc = comprobante.tipo_comprobante;
  const nombre  = `${config.ruc}-${tipoDoc}-${comprobante.serie}-${comprobante.correlativo}`;

  const payload = { claveSecreta, nombre };

  const resp = await axios.post('https://miapi.cloud/apifact/sunat/send', payload, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    timeout: 30000
  });

  return resp.data;
}

module.exports = { consultarDNI, consultarRUC, emitirComprobante, enviarSunat };
