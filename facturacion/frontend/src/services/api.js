import axios from 'axios';

// En desarrollo usa el proxy de package.json (puerto 3001)
// En producción usa la variable de entorno si existe
const BASE_URL = process.env.REACT_APP_API_URL || '/api';

const API = axios.create({ baseURL: BASE_URL });

export const consultarDNI = (dni) => API.get(`/consulta/dni/${dni}`).then(r => r.data.data);
export const consultarRUC = (ruc) => API.get(`/consulta/ruc/${ruc}`).then(r => r.data.data);

export const getCategorias = () => API.get('/categorias').then(r => r.data.data);
export const crearCategoria = (data) => API.post('/categorias', data).then(r => r.data);
export const actualizarCategoria = (id, data) => API.put(`/categorias/${id}`, data).then(r => r.data);
export const eliminarCategoria = (id) => API.delete(`/categorias/${id}`).then(r => r.data);

export const getProductos = (params) => API.get('/productos', { params }).then(r => r.data.data);
export const getProducto = (id) => API.get(`/productos/${id}`).then(r => r.data.data);
export const crearProducto = (data) => API.post('/productos', data).then(r => r.data);
export const actualizarProducto = (id, data) => API.put(`/productos/${id}`, data).then(r => r.data);
export const eliminarProducto = (id) => API.delete(`/productos/${id}`).then(r => r.data);

export const getClientes = (q) => API.get('/clientes', { params: { q } }).then(r => r.data.data);
export const crearCliente = (data) => API.post('/clientes', data).then(r => r.data);

export const getComprobantes = (params) => API.get('/comprobantes', { params }).then(r => r.data);
export const getComprobante = (id) => API.get(`/comprobantes/${id}`).then(r => r.data);
export const crearComprobante = (data) => API.post('/comprobantes', data).then(r => r.data);
export const emitirComprobante = (id) => API.post(`/comprobantes/${id}/emitir`).then(r => r.data);
export const canjearBoleta = (id, data) => API.post(`/comprobantes/${id}/canjear`, data).then(r => r.data);
export const notaCredito = (id, data) => API.post(`/comprobantes/${id}/nota-credito`, data).then(r => r.data);
export const getEstadisticas = () => API.get('/comprobantes/estadisticas').then(r => r.data.stats);

export const getConfiguracion = () => API.get('/configuracion').then(r => r.data.data);
export const guardarConfiguracion = (data) => API.post('/configuracion', data).then(r => r.data);

export default API;
