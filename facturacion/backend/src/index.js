require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db, initDB } = require('./database');
const { consultarDNI, consultarRUC } = require('./services/sunat.service');
const comp = require('./controllers/comprobantes.controller');
const { categorias, productos, clientes, configuracion } = require('./controllers/otros.controller');

const app = express();
app.use(cors());
app.use(express.json());

// Consultas RENIEC/SUNAT
app.get('/api/consulta/dni/:dni', async (req, res) => {
  const { dni } = req.params;
  if (!/^\d{8}$/.test(dni)) return res.status(400).json({ error: 'DNI debe tener 8 digitos' });
  try { res.json({ ok: true, data: await consultarDNI(dni) }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.get('/api/consulta/ruc/:ruc', async (req, res) => {
  const { ruc } = req.params;
  if (!/^\d{11}$/.test(ruc)) return res.status(400).json({ error: 'RUC debe tener 11 digitos' });
  try { res.json({ ok: true, data: await consultarRUC(ruc) }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// Categorias
app.get('/api/categorias', categorias.listar);
app.post('/api/categorias', categorias.crear);
app.put('/api/categorias/:id', categorias.actualizar);
app.delete('/api/categorias/:id', categorias.eliminar);

// Productos
app.get('/api/productos', productos.listar);
app.get('/api/productos/:id', productos.obtener);
app.post('/api/productos', productos.crear);
app.put('/api/productos/:id', productos.actualizar);
app.delete('/api/productos/:id', productos.eliminar);

// Clientes
app.get('/api/clientes', clientes.listar);
app.post('/api/clientes', clientes.crear);

// Comprobantes
app.get('/api/comprobantes/estadisticas', comp.estadisticas);
app.get('/api/comprobantes', comp.listar);
app.get('/api/comprobantes/:id', comp.obtener);
app.post('/api/comprobantes', comp.crear);
app.post('/api/comprobantes/:id/emitir', comp.emitir);
app.post('/api/comprobantes/:id/canjear', comp.canjear);
app.post('/api/comprobantes/:id/nota-credito', comp.notaCredito);

// Configuracion
app.get('/api/configuracion', configuracion.obtener);
app.post('/api/configuracion', configuracion.guardar);

app.get('/api/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;

initDB().then(() => {
  app.listen(PORT, () => console.log(`✅ Backend en http://localhost:${PORT}`));
}).catch(e => { console.error('Error iniciando BD:', e); process.exit(1); });
