require('dotenv').config();
const knex = require('knex');

const db = knex({
  client: 'mysql2',
  connection: {
    host:     process.env.DB_HOST || 'localhost',
    port:     process.env.DB_PORT || 3306,
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'facturacion',
    charset:  'utf8mb4'
  },
  pool: { min: 0, max: 10 }
});

async function initDB() {

  const hasCfg = await db.schema.hasTable('configuracion');
  if (!hasCfg) {
    await db.schema.createTable('configuracion', t => {
      t.increments('id');
      t.string('ruc', 11).notNullable().unique();
      t.string('razon_social', 200).notNullable();
      t.string('nombre_comercial', 200);
      t.string('direccion', 300).defaultTo('');
      t.string('email', 100);
      t.string('telefono', 20);
      t.string('moneda_defecto', 3).defaultTo('PEN');
      t.decimal('igv_porcentaje', 5, 2).defaultTo(18.00);
      t.string('serie_boleta', 4).defaultTo('B001');
      t.string('serie_factura', 4).defaultTo('F001');
      t.string('serie_nota_credito', 4).defaultTo('BC01');
      t.integer('correlativo_boleta').defaultTo(1);
      t.integer('correlativo_factura').defaultTo(1);
      t.integer('correlativo_nota_credito').defaultTo(1);
      t.string('ambiente', 10).defaultTo('beta');
      t.string('miapi_token', 100);
      t.string('miapi_clave', 100);
      t.string('miapi_ruc', 11);
      t.string('api_facturacion', 20).defaultTo('miapi');
      t.timestamps(true, true);
    });
    console.log('✅ Tabla configuracion creada');
  }

  const hasCat = await db.schema.hasTable('categorias');
  if (!hasCat) {
    await db.schema.createTable('categorias', t => {
      t.increments('id');
      t.string('nombre', 100).notNullable().unique();
      t.string('descripcion', 300);
      t.boolean('activo').defaultTo(true);
      t.timestamps(true, true);
    });
    console.log('✅ Tabla categorias creada');
  }

  const hasProd = await db.schema.hasTable('productos');
  if (!hasProd) {
    await db.schema.createTable('productos', t => {
      t.increments('id');
      t.string('codigo', 50).unique();
      t.string('nombre', 200).notNullable();
      t.text('descripcion');
      t.integer('categoria_id').unsigned().references('id').inTable('categorias').onDelete('SET NULL');
      t.enum('tipo', ['producto','servicio']).defaultTo('producto');
      t.string('unidad_medida', 10).defaultTo('NIU');
      t.decimal('precio_unitario', 12, 6).defaultTo(0);
      t.decimal('precio_con_igv', 12, 2).defaultTo(0);
      t.boolean('afecto_igv').defaultTo(true);
      t.decimal('stock', 12, 2).defaultTo(0);
      t.decimal('stock_minimo', 12, 2).defaultTo(0);
      t.boolean('activo').defaultTo(true);
      t.timestamps(true, true);
    });
    console.log('✅ Tabla productos creada');
  }

  const hasCli = await db.schema.hasTable('clientes');
  if (!hasCli) {
    await db.schema.createTable('clientes', t => {
      t.increments('id');
      t.enum('tipo_documento', ['DNI','RUC','CE','PASAPORTE']).defaultTo('DNI');
      t.string('numero_documento', 20).notNullable();
      t.string('nombre', 200).notNullable();
      t.string('direccion', 300);
      t.string('email', 100);
      t.string('telefono', 20);
      t.boolean('activo').defaultTo(true);
      t.timestamps(true, true);
      t.unique(['tipo_documento','numero_documento']);
    });
    console.log('✅ Tabla clientes creada');
  }

  const hasComp = await db.schema.hasTable('comprobantes');
  if (!hasComp) {
    await db.schema.createTable('comprobantes', t => {
      t.increments('id');
      t.string('uuid', 36).unique().notNullable();
      t.enum('tipo_comprobante', ['01','03','07','08']).notNullable();
      t.string('serie', 4).notNullable();
      t.integer('correlativo').notNullable();
      t.string('numero_completo', 20).notNullable();
      t.date('fecha_emision').notNullable();
      t.string('moneda', 3).defaultTo('PEN');
      t.integer('cliente_id').unsigned().references('id').inTable('clientes').onDelete('SET NULL');
      t.string('cliente_tipo_doc', 10);
      t.string('cliente_num_doc', 20);
      t.string('cliente_nombre', 200);
      t.string('cliente_direccion', 300);
      t.decimal('subtotal', 12, 2).defaultTo(0);
      t.decimal('base_imponible', 12, 2).defaultTo(0);
      t.decimal('igv', 12, 2).defaultTo(0);
      t.decimal('total', 12, 2).defaultTo(0);
      t.decimal('op_gravada', 12, 2).defaultTo(0);
      t.decimal('op_exonerada', 12, 2).defaultTo(0);
      t.decimal('op_inafecta', 12, 2).defaultTo(0);
      t.enum('estado', ['PENDIENTE','ENVIADO','ACEPTADO','RECHAZADO','ANULADO','BAJA']).defaultTo('PENDIENTE');
      t.text('sunat_mensaje');
      // ── Links miapi.cloud ──────────────────────────────
      t.text('enlace_pdf_a4');          // PDF tamaño A4
      t.text('enlace_pdf_ticket');      // PDF tamaño Ticket
      t.text('enlace_xml_firmado');     // XML firmado digitalmente
      t.text('enlace_xml_sin_firmar');  // XML sin firmar
      t.string('hash_cpe', 100);        // Hash del comprobante
      t.string('nombre_archivo', 100);  // Ej: 10777923761-01-F001-1
      // ── Canje / NC ────────────────────────────────────
      t.boolean('es_canje').defaultTo(false);
      t.integer('comprobante_origen_id').unsigned().references('id').inTable('comprobantes').onDelete('SET NULL');
      t.string('motivo_nc', 200);
      t.string('tipo_nota_credito', 5);
      t.text('observaciones');
      t.timestamps(true, true);
      t.unique(['serie','correlativo']);
    });
    console.log('✅ Tabla comprobantes creada');
  }

  const hasItems = await db.schema.hasTable('comprobante_items');
  if (!hasItems) {
    await db.schema.createTable('comprobante_items', t => {
      t.increments('id');
      t.integer('comprobante_id').unsigned().notNullable().references('id').inTable('comprobantes').onDelete('CASCADE');
      t.integer('producto_id').unsigned().references('id').inTable('productos').onDelete('SET NULL');
      t.string('descripcion', 300).notNullable();
      t.string('unidad_medida', 10).defaultTo('NIU');
      t.decimal('cantidad', 12, 2).defaultTo(1);
      t.decimal('precio_unitario', 12, 6).notNullable();
      t.decimal('precio_con_igv', 12, 2).notNullable();
      t.decimal('descuento', 12, 2).defaultTo(0);
      t.boolean('afecto_igv').defaultTo(true);
      t.decimal('base_imponible', 12, 2).notNullable();
      t.decimal('igv', 12, 2).notNullable();
      t.decimal('total_item', 12, 2).notNullable();
      t.integer('orden').defaultTo(0);
    });
    console.log('✅ Tabla comprobante_items creada');
  }

  // SEED
  const cfgCount = await db('configuracion').count('id as n').first();
  if (cfgCount.n == 0) {
    await db('configuracion').insert({
      ruc: '10777923761', razon_social: 'ALBERCA SOBERON BRAYAN ALDAIR',
      nombre_comercial: 'Brayan', direccion: 'AV. Piura NRO. 350 URB. Patazca, Chiclayo',
      email: 'soberonaldair5@gmail.com', telefono: '955563199',
      miapi_token: process.env.MIAPI_TOKEN || '',
      miapi_clave: process.env.MIAPI_CLAVE || '',
      miapi_ruc: '10777923761'
    });
    await db('categorias').insert([
      { nombre:'Electronica', descripcion:'Equipos electronicos' },
      { nombre:'Alimentos',   descripcion:'Productos alimenticios' },
      { nombre:'Servicios',   descripcion:'Servicios profesionales' },
      { nombre:'Ropa',        descripcion:'Prendas de vestir' },
      { nombre:'Otros',       descripcion:'Otros productos' }
    ]);
    await db('productos').insert([
      { codigo:'P001', nombre:'Laptop Lenovo 15"',    categoria_id:1, precio_unitario:2118.644068, precio_con_igv:2500.00, afecto_igv:1, unidad_medida:'NIU', stock:10 },
      { codigo:'P002', nombre:'Mouse Inalambrico',    categoria_id:1, precio_unitario:42.372881,   precio_con_igv:50.00,   afecto_igv:1, unidad_medida:'NIU', stock:50 },
      { codigo:'P003', nombre:'Arroz Costeno 1kg',    categoria_id:2, precio_unitario:4.237288,    precio_con_igv:5.00,    afecto_igv:1, unidad_medida:'KGM', stock:200 },
      { codigo:'P004', nombre:'Consultoria TI (hora)',categoria_id:3, precio_unitario:84.745763,   precio_con_igv:100.00,  afecto_igv:1, unidad_medida:'HUR', stock:0 },
      { codigo:'P005', nombre:'Polo Basico',          categoria_id:4, precio_unitario:25.423729,   precio_con_igv:30.00,   afecto_igv:1, unidad_medida:'NIU', stock:100 }
    ]);
    console.log('✅ Datos iniciales insertados');
  }
  console.log('✅ Base de datos MySQL lista');
}

module.exports = { db, initDB };
