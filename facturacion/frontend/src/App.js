import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import * as api from './services/api';

// ─── ICONS (SVG inline) ───────────────────────────────────────────────────────
const Icon = ({ name, size = 16 }) => {
  const icons = {
    home: <path d="M3 12L12 3l9 9M5 10v9h5v-5h4v5h5v-9"/>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    package: <><path d="M12 2l9 5v10L12 22 3 17V7z"/><polyline points="12 22 12 12"/><path d="M3 7l9 5 9-5"/></>,
    tag: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    refresh: <polyline points="23 4 23 10 17 10"/>,
    send: <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    swap: <><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></>,
    xCircle: <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>,
    check: <polyline points="20 6 9 11 4 16"/>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    chevronRight: <polyline points="9 18 15 12 9 6"/>,
    alertCircle: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
    checkCircle: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
    clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    barChart: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  app: { display: 'flex', height: '100vh', fontFamily: "'IBM Plex Sans', system-ui, sans-serif", background: '#0f1117', color: '#e2e8f0', overflow: 'hidden' },
  sidebar: { width: 220, background: '#161b27', borderRight: '1px solid #1e2535', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  sidebarLogo: { padding: '20px 16px 12px', borderBottom: '1px solid #1e2535' },
  logoText: { fontSize: 14, fontWeight: 700, color: '#60a5fa', letterSpacing: 1 },
  logoSub: { fontSize: 10, color: '#64748b', marginTop: 2 },
  nav: { padding: '8px 0', flex: 1 },
  navItem: (active) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', cursor: 'pointer', fontSize: 13, color: active ? '#60a5fa' : '#94a3b8', background: active ? '#1e3a5f22' : 'transparent', borderLeft: active ? '2px solid #60a5fa' : '2px solid transparent', transition: 'all 0.15s' }),
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topbar: { background: '#161b27', borderBottom: '1px solid #1e2535', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  topTitle: { fontSize: 15, fontWeight: 600, color: '#e2e8f0' },
  content: { flex: 1, overflow: 'auto', padding: 20 },
  card: { background: '#161b27', border: '1px solid #1e2535', borderRadius: 10, padding: '16px 20px', marginBottom: 16 },
  input: { background: '#0f1117', border: '1px solid #1e2535', borderRadius: 6, padding: '8px 12px', color: '#e2e8f0', fontSize: 13, width: '100%', outline: 'none', boxSizing: 'border-box' },
  select: { background: '#0f1117', border: '1px solid #1e2535', borderRadius: 6, padding: '8px 12px', color: '#e2e8f0', fontSize: 13, width: '100%', outline: 'none' },
  btn: (variant = 'primary') => ({
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
    ...(variant === 'primary' && { background: '#2563eb', color: '#fff' }),
    ...(variant === 'success' && { background: '#16a34a', color: '#fff' }),
    ...(variant === 'danger' && { background: '#dc2626', color: '#fff' }),
    ...(variant === 'ghost' && { background: 'transparent', color: '#94a3b8', border: '1px solid #1e2535' }),
    ...(variant === 'warning' && { background: '#d97706', color: '#fff' }),
  }),
  label: { fontSize: 12, color: '#64748b', marginBottom: 4, display: 'block' },
  grid: (cols) => ({ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }),
  statCard: (color = '#60a5fa') => ({ background: '#161b27', border: `1px solid #1e2535`, borderRadius: 10, padding: '16px 20px', borderLeft: `3px solid ${color}` }),
  badge: (color) => {
    const map = { PENDIENTE: ['#854d0e','#fef08a'], ENVIADO: ['#1e40af','#93c5fd'], ACEPTADO: ['#166534','#86efac'], RECHAZADO: ['#991b1b','#fca5a5'], ANULADO: ['#374151','#9ca3af'], BAJA: ['#374151','#9ca3af'] };
    const [bg, fg] = map[color] || ['#374151','#9ca3af'];
    return { background: bg, color: fg, fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600 };
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: { textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #1e2535', color: '#64748b', fontSize: 12, fontWeight: 500 },
  td: { padding: '10px 12px', borderBottom: '1px solid #0f1117', color: '#e2e8f0' },
  formGroup: { marginBottom: 14 },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#161b27', border: '1px solid #1e2535', borderRadius: 12, padding: 24, width: '90%', maxWidth: 680, maxHeight: '85vh', overflow: 'auto' },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (n) => `S/ ${parseFloat(n || 0).toFixed(2)}`;
const tipoLabel = { '01': 'Factura', '03': 'Boleta', '07': 'Nota Crédito', '08': 'Nota Débito' };
const tipoColor = { '01': '#60a5fa', '03': '#34d399', '07': '#f59e0b', '08': '#f87171' };

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ onNav }) {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.getEstadisticas().then(setStats).catch(() => {}); }, []);
  if (!stats) return <div style={{ color: '#64748b', padding: 40, textAlign: 'center' }}>Cargando...</div>;

  const por_tipo = Object.fromEntries((stats.por_tipo || []).map(r => [r.tipo_comprobante, r]));
  const por_estado = Object.fromEntries((stats.por_estado || []).map(r => [r.estado, r]));

  return (
    <div>
      <div style={S.grid(4)}>
        {[
          { label: 'Ventas hoy', value: fmt(stats.hoy?.total), sub: `${stats.hoy?.n || 0} comprobantes`, color: '#60a5fa' },
          { label: 'Ventas del mes', value: fmt(stats.mes?.total), sub: `${stats.mes?.n || 0} comprobantes`, color: '#34d399' },
          { label: 'Facturas emitidas', value: por_tipo['01']?.n || 0, sub: fmt(por_tipo['01']?.total), color: '#60a5fa' },
          { label: 'Boletas emitidas', value: por_tipo['03']?.n || 0, sub: fmt(por_tipo['03']?.total), color: '#34d399' },
        ].map((s, i) => (
          <div key={i} style={S.statCard(s.color)}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ ...S.grid(2), marginTop: 16 }}>
        <div style={S.card}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: '#94a3b8' }}>Estado de Comprobantes</div>
          {['PENDIENTE','ACEPTADO','RECHAZADO','ANULADO'].map(est => (
            <div key={est} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e2535' }}>
              <span style={S.badge(est)}>{est}</span>
              <span style={{ fontSize: 13, color: '#e2e8f0' }}>{por_estado[est]?.n || 0}</span>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: '#94a3b8' }}>Últimos Comprobantes</div>
          {(stats.recientes || []).map(c => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e2535' }}>
              <div>
                <span style={{ fontSize: 12, color: tipoColor[c.tipo_comprobante] || '#94a3b8', fontWeight: 600 }}>{c.numero_completo}</span>
                <div style={{ fontSize: 11, color: '#64748b' }}>{c.cliente_nombre}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#34d399' }}>{fmt(c.total)}</div>
                <span style={S.badge(c.estado)}>{c.estado}</span>
              </div>
            </div>
          ))}
          <button style={{ ...S.btn('ghost'), marginTop: 12, width: '100%', justifyContent: 'center' }} onClick={() => onNav('comprobantes')}>
            Ver todos <Icon name="chevronRight" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CONSULTA DNI/RUC ─────────────────────────────────────────────────────────
function ConsultaDocumento({ tipo, onSelect }) {
  const [num, setNum] = useState('');
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);

  const consultar = async () => {
    if (!num) return;
    setLoading(true); setRes(null);
    try {
      const data = tipo === 'DNI' ? await api.consultarDNI(num) : await api.consultarRUC(num);
      setRes(data);
    } catch (e) { toast.error('Error de consulta: ' + (e.response?.data?.error || e.message)); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <input style={{ ...S.input, width: 160 }} placeholder={tipo === 'DNI' ? '12345678' : '20123456789'}
        value={num} onChange={e => setNum(e.target.value)} onKeyDown={e => e.key === 'Enter' && consultar()} maxLength={tipo === 'DNI' ? 8 : 11} />
      <button style={S.btn()} onClick={consultar} disabled={loading}>
        {loading ? '...' : <><Icon name="search" size={14} /> Consultar</>}
      </button>
      {res && (
        <div style={{ background: '#0f1117', border: '1px solid #1e2535', borderRadius: 6, padding: '8px 12px', fontSize: 12, minWidth: 200 }}>
          <div style={{ color: '#34d399', fontWeight: 600 }}>{res.nombre || res.razon_social}</div>
          {res.direccion && <div style={{ color: '#64748b', marginTop: 2 }}>{res.direccion}</div>}
          {res.estado && <div style={{ color: '#64748b' }}>Estado: {res.estado}</div>}
          {res.demo && <div style={{ color: '#f59e0b', fontSize: 11 }}>⚠ Modo demo - configure token API</div>}
          {onSelect && (
            <button style={{ ...S.btn('success'), marginTop: 8, fontSize: 11, padding: '4px 10px' }} onClick={() => onSelect(res)}>
              Usar este {tipo}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MODAL NUEVO COMPROBANTE ──────────────────────────────────────────────────
function ModalComprobante({ onClose, onCreado, tipo: tipoInicial = '03' }) {
  const [tipo, setTipo] = useState(tipoInicial);
  const [cliente, setCliente] = useState({ tipo_documento: 'DNI', numero_documento: '', nombre: '', direccion: '' });
  const [items, setItems] = useState([{ descripcion: '', unidad_medida: 'NIU', cantidad: 1, precio_con_igv: 0, afecto_igv: true, descuento: 0 }]);
  const [productos, setProductos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [busqProd, setBusqProd] = useState('');

  useEffect(() => { api.getProductos({ activo: 1 }).then(setProductos).catch(() => {}); }, []);

  const IGV = 0.18;
  const calcItem = (it) => {
    const base = it.afecto_igv ? it.precio_con_igv / (1 + IGV) : it.precio_con_igv;
    const igv = it.afecto_igv ? base * IGV : 0;
    return { base: +(base * it.cantidad - (it.descuento || 0)).toFixed(2), igv: +(igv * it.cantidad).toFixed(2), total: +(it.precio_con_igv * it.cantidad - (it.descuento || 0)).toFixed(2) };
  };
  const totales = items.reduce((acc, it) => { const c = calcItem(it); return { base: acc.base + c.base, igv: acc.igv + c.igv, total: acc.total + c.total }; }, { base: 0, igv: 0, total: 0 });

  const agregarItem = () => setItems(prev => [...prev, { descripcion: '', unidad_medida: 'NIU', cantidad: 1, precio_con_igv: 0, afecto_igv: true, descuento: 0 }]);
  const quitarItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updItem = (i, field, val) => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: val } : it));
  const selProd = (i, prod) => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, producto_id: prod.id, descripcion: prod.nombre, precio_con_igv: prod.precio_con_igv, unidad_medida: prod.unidad_medida, afecto_igv: !!prod.afecto_igv } : it));

  const guardar = async () => {
    if (!items.every(it => it.descripcion && it.precio_con_igv > 0)) return toast.error('Complete todos los ítems');
    if (tipo === '01' && cliente.tipo_documento !== 'RUC') return toast.error('La factura requiere RUC');
    setSaving(true);
    try {
      const r = await api.crearComprobante({ tipo_comprobante: tipo, cliente: cliente.numero_documento ? cliente : null, items });
      toast.success(`${tipoLabel[tipo]} ${r.numero} creado`);
      onCreado(r.comprobante);
    } catch (e) { toast.error(e.response?.data?.error || 'Error al crear'); }
    finally { setSaving(false); }
  };

  const filtProd = productos.filter(p => p.nombre.toLowerCase().includes(busqProd.toLowerCase()) || p.codigo?.includes(busqProd)).slice(0, 8);

  return (
    <div style={S.modal} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modalContent}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Nuevo Comprobante</h3>
          <button style={S.btn('ghost')} onClick={onClose}><Icon name="xCircle" size={14} /></button>
        </div>

        {/* Tipo */}
        <div style={S.formGroup}>
          <label style={S.label}>Tipo de Comprobante</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['03','Boleta','#34d399'],['01','Factura','#60a5fa']].map(([t,l,c]) => (
              <button key={t} style={{ ...S.btn(tipo === t ? 'primary' : 'ghost'), borderColor: tipo === t ? c : undefined, background: tipo === t ? c + '22' : undefined, color: tipo === t ? c : undefined }} onClick={() => { setTipo(t); if (t === '01') setCliente(prev => ({ ...prev, tipo_documento: 'RUC' })); }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Cliente */}
        <div style={{ ...S.card, padding: '12px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 10 }}>DATOS DEL CLIENTE</div>
          <div style={S.grid(3)}>
            <div style={S.formGroup}>
              <label style={S.label}>Tipo Doc.</label>
              <select style={S.select} value={cliente.tipo_documento} onChange={e => setCliente(p => ({ ...p, tipo_documento: e.target.value }))}>
                {tipo === '01' ? <option value="RUC">RUC</option> : <><option value="DNI">DNI</option><option value="RUC">RUC</option><option value="CE">Carné Extranjería</option><option value="PASAPORTE">Pasaporte</option></>}
              </select>
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Número</label>
              <input style={S.input} value={cliente.numero_documento} onChange={e => setCliente(p => ({ ...p, numero_documento: e.target.value }))} placeholder={cliente.tipo_documento === 'RUC' ? '20123456789' : '12345678'} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 14 }}>
              <ConsultaDocumento tipo={cliente.tipo_documento} onSelect={d => setCliente(p => ({ ...p, nombre: d.razon_social || d.nombre || '', direccion: d.direccion || '' }))} />
            </div>
          </div>
          <div style={S.grid(2)}>
            <div style={S.formGroup}>
              <label style={S.label}>Nombre / Razón Social</label>
              <input style={S.input} value={cliente.nombre} onChange={e => setCliente(p => ({ ...p, nombre: e.target.value }))} placeholder="Nombre del cliente" />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Dirección</label>
              <input style={S.input} value={cliente.direccion} onChange={e => setCliente(p => ({ ...p, direccion: e.target.value }))} placeholder="Dirección" />
            </div>
          </div>
        </div>

        {/* Items */}
        <div style={{ ...S.card, padding: '12px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>ITEMS</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input style={{ ...S.input, width: 180, fontSize: 11 }} placeholder="Buscar producto..." value={busqProd} onChange={e => setBusqProd(e.target.value)} />
              <button style={{ ...S.btn('ghost'), fontSize: 11 }} onClick={agregarItem}><Icon name="plus" size={12} /> Agregar</button>
            </div>
          </div>

          {busqProd && filtProd.length > 0 && (
            <div style={{ background: '#0f1117', border: '1px solid #1e2535', borderRadius: 6, marginBottom: 10, maxHeight: 160, overflow: 'auto' }}>
              {filtProd.map(p => (
                <div key={p.id} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #1e2535', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}
                  onClick={() => { selProd(items.length - 1, p); setBusqProd(''); }}>
                  <span>{p.codigo && <span style={{ color: '#64748b', marginRight: 6 }}>[{p.codigo}]</span>}{p.nombre}</span>
                  <span style={{ color: '#34d399' }}>{fmt(p.precio_con_igv)}</span>
                </div>
              ))}
            </div>
          )}

          <table style={S.table}>
            <thead><tr>
              <th style={S.th}>Descripción</th>
              <th style={{ ...S.th, width: 60 }}>U.M.</th>
              <th style={{ ...S.th, width: 70 }}>Cant.</th>
              <th style={{ ...S.th, width: 90 }}>P.Unit c/IGV</th>
              <th style={{ ...S.th, width: 60 }}>IGV</th>
              <th style={{ ...S.th, width: 80 }}>Total</th>
              <th style={{ ...S.th, width: 30 }}></th>
            </tr></thead>
            <tbody>
              {items.map((it, i) => {
                const c = calcItem(it);
                return (
                  <tr key={i}>
                    <td style={S.td}><input style={{ ...S.input, fontSize: 12 }} value={it.descripcion} onChange={e => updItem(i, 'descripcion', e.target.value)} /></td>
                    <td style={S.td}>
                      <select style={{ ...S.select, fontSize: 11 }} value={it.unidad_medida} onChange={e => updItem(i, 'unidad_medida', e.target.value)}>
                        {['NIU','ZZ','KGM','LTR','MTR','HUR','DZN'].map(u => <option key={u}>{u}</option>)}
                      </select>
                    </td>
                    <td style={S.td}><input type="number" style={{ ...S.input, fontSize: 12 }} value={it.cantidad} min={1} onChange={e => updItem(i, 'cantidad', +e.target.value)} /></td>
                    <td style={S.td}><input type="number" style={{ ...S.input, fontSize: 12 }} value={it.precio_con_igv} step="0.01" onChange={e => updItem(i, 'precio_con_igv', +e.target.value)} /></td>
                    <td style={{ ...S.td, fontSize: 11, color: '#64748b' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                        <input type="checkbox" checked={it.afecto_igv} onChange={e => updItem(i, 'afecto_igv', e.target.checked)} />
                        {fmt(c.igv)}
                      </label>
                    </td>
                    <td style={{ ...S.td, color: '#34d399', fontWeight: 600 }}>{fmt(c.total)}</td>
                    <td style={S.td}><button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }} onClick={() => quitarItem(i)}><Icon name="trash" size={14} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totales */}
          <div style={{ marginTop: 12, borderTop: '1px solid #1e2535', paddingTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 220 }}>
              {[['Subtotal (sin IGV)', fmt(totales.base)],['IGV (18%)', fmt(totales.igv)],['TOTAL', fmt(totales.total)]].map(([l, v], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', ...(i === 2 && { fontWeight: 700, fontSize: 15, color: '#34d399', borderTop: '1px solid #1e2535', marginTop: 4, paddingTop: 8 }) }}>
                  <span style={{ color: i < 2 ? '#64748b' : '#e2e8f0' }}>{l}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button style={S.btn('ghost')} onClick={onClose}>Cancelar</button>
          <button style={S.btn('success')} onClick={guardar} disabled={saving}>
            <Icon name="check" size={14} /> {saving ? 'Guardando...' : 'Crear ' + tipoLabel[tipo]}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL CANJE BOLETA ───────────────────────────────────────────────────────
function ModalCanje({ boleta, onClose, onCanjeado }) {
  const [ruc, setRuc] = useState('');
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);

  const canjear = async () => {
    if (!ruc || ruc.length !== 11) return toast.error('Ingrese un RUC válido (11 dígitos)');
    setLoading(true);
    try {
      const r = await api.canjearBoleta(boleta.id, { cliente_ruc: ruc, cliente_nombre: nombre, cliente_direccion: direccion });
      toast.success(r.mensaje);
      onCanjeado(r.factura);
    } catch (e) { toast.error(e.response?.data?.error || 'Error al canjear'); }
    finally { setLoading(false); }
  };

  return (
    <div style={S.modal} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...S.modalContent, maxWidth: 480 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Canjear Boleta → Factura</h3>
        <div style={{ background: '#0f1117', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13 }}>
          <div style={{ color: '#64748b', marginBottom: 4 }}>Boleta de origen</div>
          <div style={{ color: '#60a5fa', fontWeight: 600 }}>{boleta.numero_completo}</div>
          <div style={{ color: '#e2e8f0' }}>{boleta.cliente_nombre}</div>
          <div style={{ color: '#34d399', fontWeight: 700, fontSize: 15, marginTop: 4 }}>{fmt(boleta.total)}</div>
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>RUC del Cliente *</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input style={{ ...S.input }} value={ruc} onChange={e => setRuc(e.target.value)} placeholder="20123456789" maxLength={11} />
            <ConsultaDocumento tipo="RUC" onSelect={d => { setNombre(d.razon_social || d.nombre); setDireccion(d.direccion || ''); }} />
          </div>
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Razón Social</label>
          <input style={S.input} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Razón social de la empresa" />
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Dirección fiscal</label>
          <input style={S.input} value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Dirección" />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button style={S.btn('ghost')} onClick={onClose}>Cancelar</button>
          <button style={S.btn('warning')} onClick={canjear} disabled={loading}>
            <Icon name="swap" size={14} /> {loading ? '...' : 'Realizar Canje'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── COMPROBANTES ─────────────────────────────────────────────────────────────
function Comprobantes() {
  const [comprobantes, setComprobantes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filtros, setFiltros] = useState({ tipo: '', estado: '', q: '', desde: '', hasta: '' });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tipoModal, setTipoModal] = useState('03');
  const [detalle, setDetalle] = useState(null);
  const [modalCanje, setModalCanje] = useState(null);
  const [emitiendo, setEmitiendo] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.getComprobantes({ ...filtros, page, limit: 15 });
      setComprobantes(r.data); setTotal(r.total);
    } catch (e) { toast.error('Error al cargar'); }
    finally { setLoading(false); }
  }, [filtros, page]);

  useEffect(() => { cargar(); }, [cargar]);

  const emitir = async (id) => {
    setEmitiendo(id);
    try {
      const r = await api.emitirComprobante(id);
      toast.success(r.demo ? 'Emitido en modo demo' : `Emitido: ${r.numero}`);
      cargar();
    } catch (e) { toast.error(e.response?.data?.error || 'Error al emitir'); }
    finally { setEmitiendo(null); }
  };

  const anular = async (comp) => {
    if (!window.confirm(`¿Anular ${comp.numero_completo}?`)) return;
    try {
      await api.notaCredito(comp.id, { motivo: 'Anulación', tipo_nota: '01' });
      toast.success('Nota de crédito generada'); cargar();
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input style={{ ...S.input, width: 200 }} placeholder="Buscar número, cliente..." value={filtros.q} onChange={e => setFiltros(p => ({ ...p, q: e.target.value }))} />
        <select style={{ ...S.select, width: 130 }} value={filtros.tipo} onChange={e => setFiltros(p => ({ ...p, tipo: e.target.value }))}>
          <option value="">Todos los tipos</option>
          <option value="01">Factura</option>
          <option value="03">Boleta</option>
          <option value="07">Nota Crédito</option>
        </select>
        <select style={{ ...S.select, width: 130 }} value={filtros.estado} onChange={e => setFiltros(p => ({ ...p, estado: e.target.value }))}>
          <option value="">Todos los estados</option>
          {['PENDIENTE','ENVIADO','ACEPTADO','RECHAZADO','ANULADO'].map(e => <option key={e}>{e}</option>)}
        </select>
        <input type="date" style={{ ...S.input, width: 140 }} value={filtros.desde} onChange={e => setFiltros(p => ({ ...p, desde: e.target.value }))} />
        <input type="date" style={{ ...S.input, width: 140 }} value={filtros.hasta} onChange={e => setFiltros(p => ({ ...p, hasta: e.target.value }))} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button style={S.btn('ghost')} onClick={() => { setTipoModal('03'); setShowModal(true); }}><Icon name="plus" size={14} /> Boleta</button>
          <button style={S.btn()} onClick={() => { setTipoModal('01'); setShowModal(true); }}><Icon name="plus" size={14} /> Factura</button>
        </div>
      </div>

      <div style={S.card}>
        <table style={S.table}>
          <thead><tr>
            <th style={S.th}>Número</th>
            <th style={S.th}>Tipo</th>
            <th style={S.th}>Fecha</th>
            <th style={S.th}>Cliente</th>
            <th style={S.th}>Total</th>
            <th style={S.th}>Estado</th>
            <th style={S.th}>Acciones</th>
          </tr></thead>
          <tbody>
            {loading && <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: '#64748b' }}>Cargando...</td></tr>}
            {!loading && comprobantes.length === 0 && <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: '#64748b' }}>Sin comprobantes</td></tr>}
            {comprobantes.map(c => (
              <tr key={c.id}>
                <td style={S.td}>
                  <span style={{ color: tipoColor[c.tipo_comprobante], fontWeight: 600, fontSize: 12 }}>{c.numero_completo}</span>
                  {c.es_canje === 1 && <span style={{ fontSize: 10, background: '#7c3aed22', color: '#a78bfa', padding: '1px 5px', borderRadius: 4, marginLeft: 4 }}>CANJE</span>}
                </td>
                <td style={S.td}><span style={{ fontSize: 11, color: tipoColor[c.tipo_comprobante] }}>{tipoLabel[c.tipo_comprobante]}</span></td>
                <td style={{ ...S.td, fontSize: 12, color: '#94a3b8' }}>{c.fecha_emision}</td>
                <td style={S.td}>
                  <div style={{ fontSize: 13 }}>{c.cliente_nombre || 'Varios'}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{c.cliente_tipo_doc} {c.cliente_num_doc}</div>
                </td>
                <td style={{ ...S.td, color: '#34d399', fontWeight: 600 }}>{fmt(c.total)}</td>
                <td style={S.td}><span style={S.badge(c.estado)}>{c.estado}</span></td>
                <td style={S.td}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button title="Ver detalle" style={{ ...S.btn('ghost'), padding: '4px 8px' }} onClick={() => setDetalle(c)}><Icon name="eye" size={12} /></button>
                    {c.estado === 'PENDIENTE' && (
                      <button title="Emitir a SUNAT" style={{ ...S.btn('success'), padding: '4px 8px', fontSize: 11 }} onClick={() => emitir(c.id)} disabled={emitiendo === c.id}>
                        {emitiendo === c.id ? '...' : <><Icon name="send" size={12} /> Emitir</>}
                      </button>
                    )}
                    {c.tipo_comprobante === '03' && !c.es_canje && c.estado !== 'ANULADO' && (
                      <button title="Canjear a Factura" style={{ ...S.btn('warning'), padding: '4px 8px', fontSize: 11 }} onClick={() => setModalCanje(c)}>
                        <Icon name="swap" size={12} /> Canje
                      </button>
                    )}
                    {['ACEPTADO','PENDIENTE'].includes(c.estado) && c.tipo_comprobante !== '07' && (
                      <button title="Anular / Nota de Crédito" style={{ ...S.btn('danger'), padding: '4px 8px', fontSize: 11 }} onClick={() => anular(c)}>
                        <Icon name="xCircle" size={12} />
                      </button>
                    )}
                    {(c.enlace_pdf_a4 || c.enlace_pdf) && (
                      <a href={c.enlace_pdf_a4 || c.enlace_pdf} target="_blank" rel="noreferrer" style={{ ...S.btn('ghost'), padding: '4px 8px', textDecoration: 'none', fontSize: 10 }} title="PDF A4">
                        PDF
                      </a>
                    )}
                    {c.enlace_pdf_ticket && (
                      <a href={c.enlace_pdf_ticket} target="_blank" rel="noreferrer" style={{ ...S.btn('ghost'), padding: '4px 8px', textDecoration: 'none', fontSize: 10 }} title="PDF Ticket">
                        Ticket
                      </a>
                    )}
                    {c.enlace_xml_firmado && (
                      <a href={c.enlace_xml_firmado} target="_blank" rel="noreferrer" style={{ ...S.btn('ghost'), padding: '4px 8px', textDecoration: 'none', fontSize: 10, color: '#34d399' }} title="XML Firmado">
                        XML
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>Total: {total} registros</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={S.btn('ghost')} disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
            <span style={{ fontSize: 12, color: '#94a3b8', lineHeight: '32px' }}>Pág. {page}</span>
            <button style={S.btn('ghost')} disabled={page * 15 >= total} onClick={() => setPage(p => p + 1)}>Siguiente</button>
          </div>
        </div>
      </div>

      {showModal && <ModalComprobante tipo={tipoModal} onClose={() => setShowModal(false)} onCreado={(c) => { setShowModal(false); cargar(); setDetalle(c); }} />}
      {modalCanje && <ModalCanje boleta={modalCanje} onClose={() => setModalCanje(null)} onCanjeado={(f) => { setModalCanje(null); cargar(); setDetalle(f); }} />}
      {detalle && <DetalleModal comprobante={detalle} onClose={() => setDetalle(null)} onEmitir={() => { emitir(detalle.id); setDetalle(null); }} onCanje={() => { setModalCanje(detalle); setDetalle(null); }} onAnular={() => { anular(detalle); setDetalle(null); }} />}
    </div>
  );
}

// ─── DETALLE COMPROBANTE ──────────────────────────────────────────────────────
function DetalleModal({ comprobante: c, onClose, onEmitir, onCanje, onAnular }) {
  const [items, setItems] = useState([]);
  useEffect(() => { api.getComprobante(c.id).then(r => setItems(r.items)).catch(() => {}); }, [c.id]);
  return (
    <div style={S.modal} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...S.modalContent, maxWidth: 600 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: tipoColor[c.tipo_comprobante] }}>{c.numero_completo}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{tipoLabel[c.tipo_comprobante]} · {c.fecha_emision}</div>
          </div>
          <span style={S.badge(c.estado)}>{c.estado}</span>
        </div>
        <div style={{ background: '#0f1117', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>CLIENTE</div>
          <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{c.cliente_nombre || 'Varios'}</div>
          {c.cliente_num_doc && <div style={{ fontSize: 12, color: '#94a3b8' }}>{c.cliente_tipo_doc} {c.cliente_num_doc}</div>}
          {c.cliente_direccion && <div style={{ fontSize: 12, color: '#64748b' }}>{c.cliente_direccion}</div>}
        </div>
        <table style={S.table}>
          <thead><tr>
            <th style={S.th}>Descripción</th>
            <th style={S.th}>Cant.</th>
            <th style={S.th}>P.Unit</th>
            <th style={S.th}>Total</th>
          </tr></thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}>
                <td style={S.td}>{it.descripcion} <span style={{ fontSize: 10, color: '#64748b' }}>({it.unidad_medida})</span></td>
                <td style={S.td}>{it.cantidad}</td>
                <td style={S.td}>{fmt(it.precio_con_igv)}</td>
                <td style={{ ...S.td, color: '#34d399' }}>{fmt(it.total_item)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ borderTop: '1px solid #1e2535', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 200 }}>
            {[['Base Imponible', fmt(c.base_imponible)],['IGV 18%', fmt(c.igv)],['TOTAL', fmt(c.total)]].map(([l,v],i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', ...(i===2&&{fontWeight:700,color:'#34d399',fontSize:15,borderTop:'1px solid #1e2535',marginTop:4,paddingTop:8}) }}>
                <span style={{ color: i<2?'#64748b':'#e2e8f0' }}>{l}</span><span>{v}</span>
              </div>
            ))}
          </div>
        </div>
        {c.sunat_mensaje && <div style={{ marginTop: 12, padding: '8px 12px', background: '#0f1117', borderRadius: 6, fontSize: 12, color: '#94a3b8' }}>SUNAT: {c.sunat_mensaje}</div>}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          <button style={S.btn('ghost')} onClick={onClose}>Cerrar</button>
          {c.estado === 'PENDIENTE' && <button style={S.btn('success')} onClick={onEmitir}><Icon name="send" size={14} /> Emitir SUNAT</button>}
          {c.tipo_comprobante === '03' && !c.es_canje && c.estado !== 'ANULADO' && <button style={S.btn('warning')} onClick={onCanje}><Icon name="swap" size={14} /> Canjear a Factura</button>}
          {['ACEPTADO','PENDIENTE'].includes(c.estado) && c.tipo_comprobante !== '07' && <button style={S.btn('danger')} onClick={onAnular}><Icon name="xCircle" size={14} /> Anular</button>}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            {(c.enlace_pdf_a4 || c.enlace_pdf) && (
              <a href={c.enlace_pdf_a4 || c.enlace_pdf} target="_blank" rel="noreferrer" style={{ ...S.btn('primary'), textDecoration: 'none' }}>
                <Icon name="download" size={14} /> PDF A4
              </a>
            )}
            {c.enlace_pdf_ticket && (
              <a href={c.enlace_pdf_ticket} target="_blank" rel="noreferrer" style={{ ...S.btn('ghost'), textDecoration: 'none' }}>
                <Icon name="download" size={14} /> PDF Ticket
              </a>
            )}
            {c.enlace_xml_firmado && (
              <a href={c.enlace_xml_firmado} target="_blank" rel="noreferrer" style={{ ...S.btn('ghost'), textDecoration: 'none', color: '#34d399' }}>
                <Icon name="download" size={14} /> XML Firmado
              </a>
            )}
            {c.enlace_xml_sin_firmar && (
              <a href={c.enlace_xml_sin_firmar} target="_blank" rel="noreferrer" style={{ ...S.btn('ghost'), textDecoration: 'none', color: '#f59e0b' }}>
                <Icon name="download" size={14} /> XML Sin Firmar
              </a>
            )}
            {c.nombre_archivo && (
              <div style={{ fontSize: 11, color: '#64748b', padding: '8px 0', width: '100%' }}>
                Archivo: <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{c.nombre_archivo}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCTOS ────────────────────────────────────────────────────────────────
function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', codigo: '', categoria_id: '', tipo: 'producto', unidad_medida: 'NIU', precio_con_igv: '', afecto_igv: 1, stock: 0 });
  const [showForm, setShowForm] = useState(false);

  const cargar = useCallback(async () => {
    const [p, c] = await Promise.all([api.getProductos({ q: filtro }), api.getCategorias()]);
    setProductos(p); setCategorias(c);
  }, [filtro]);
  useEffect(() => { cargar(); }, [cargar]);

  const guardar = async () => {
    try {
      const precio_unitario = +(form.precio_con_igv / 1.18).toFixed(6);
      if (editando) { await api.actualizarProducto(editando.id, { ...form, precio_unitario }); toast.success('Actualizado'); }
      else { await api.crearProducto({ ...form, precio_unitario }); toast.success('Creado'); }
      setShowForm(false); setEditando(null); setForm({ nombre: '', codigo: '', categoria_id: '', tipo: 'producto', unidad_medida: 'NIU', precio_con_igv: '', afecto_igv: 1, stock: 0 });
      cargar();
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
  };

  const editar = (p) => { setEditando(p); setForm({ ...p, precio_con_igv: p.precio_con_igv }); setShowForm(true); };
  const eliminar = async (id) => { if (!window.confirm('¿Desactivar producto?')) return; await api.eliminarProducto(id); cargar(); };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input style={{ ...S.input, width: 240 }} placeholder="Buscar producto o código..." value={filtro} onChange={e => setFiltro(e.target.value)} />
        <button style={{ ...S.btn(), marginLeft: 'auto' }} onClick={() => { setEditando(null); setShowForm(true); }}><Icon name="plus" size={14} /> Nuevo Producto</button>
      </div>
      <div style={S.card}>
        <table style={S.table}>
          <thead><tr>
            <th style={S.th}>Código</th><th style={S.th}>Nombre</th><th style={S.th}>Categoría</th>
            <th style={S.th}>Tipo</th><th style={S.th}>P. c/IGV</th><th style={S.th}>Stock</th><th style={S.th}>Acciones</th>
          </tr></thead>
          <tbody>
            {productos.map(p => (
              <tr key={p.id}>
                <td style={{ ...S.td, fontSize: 12, color: '#64748b' }}>{p.codigo || '—'}</td>
                <td style={S.td}><div style={{ fontWeight: 500 }}>{p.nombre}</div></td>
                <td style={{ ...S.td, fontSize: 12 }}>{p.categoria_nombre || '—'}</td>
                <td style={{ ...S.td, fontSize: 11 }}><span style={{ background: p.tipo === 'servicio' ? '#1e3a5f' : '#1e4d2b', color: p.tipo === 'servicio' ? '#60a5fa' : '#4ade80', padding: '2px 8px', borderRadius: 4 }}>{p.tipo}</span></td>
                <td style={{ ...S.td, color: '#34d399', fontWeight: 600 }}>{fmt(p.precio_con_igv)}</td>
                <td style={{ ...S.td, color: p.stock <= p.stock_minimo ? '#f87171' : '#e2e8f0' }}>{p.tipo === 'servicio' ? '∞' : p.stock}</td>
                <td style={S.td}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button style={{ ...S.btn('ghost'), padding: '4px 8px' }} onClick={() => editar(p)}><Icon name="edit" size={12} /></button>
                    <button style={{ ...S.btn('danger'), padding: '4px 8px' }} onClick={() => eliminar(p.id)}><Icon name="trash" size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm && (
        <div style={S.modal} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={{ ...S.modalContent, maxWidth: 480 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>{editando ? 'Editar' : 'Nuevo'} Producto/Servicio</h3>
            <div style={S.grid(2)}>
              {[['Código','codigo','text'],['Nombre *','nombre','text'],['Precio c/IGV *','precio_con_igv','number'],['Stock','stock','number']].map(([l,f,t]) => (
                <div key={f} style={S.formGroup}>
                  <label style={S.label}>{l}</label>
                  <input type={t} style={S.input} value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: t === 'number' ? +e.target.value : e.target.value }))} />
                </div>
              ))}
              <div style={S.formGroup}>
                <label style={S.label}>Tipo</label>
                <select style={S.select} value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}>
                  <option value="producto">Producto</option><option value="servicio">Servicio</option>
                </select>
              </div>
              <div style={S.formGroup}>
                <label style={S.label}>Categoría</label>
                <select style={S.select} value={form.categoria_id} onChange={e => setForm(p => ({ ...p, categoria_id: e.target.value }))}>
                  <option value="">Sin categoría</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div style={S.formGroup}>
                <label style={S.label}>Unidad de Medida</label>
                <select style={S.select} value={form.unidad_medida} onChange={e => setForm(p => ({ ...p, unidad_medida: e.target.value }))}>
                  {['NIU','ZZ','KGM','LTR','MTR','HUR','DZN','GLL','TNE'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button style={S.btn('ghost')} onClick={() => setShowForm(false)}>Cancelar</button>
              <button style={S.btn('success')} onClick={guardar}><Icon name="check" size={14} /> Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CATEGORÍAS ───────────────────────────────────────────────────────────────
function Categorias() {
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });
  const [editando, setEditando] = useState(null);
  const cargar = () => api.getCategorias().then(setCats).catch(() => {});
  useEffect(() => { cargar(); }, []);
  const guardar = async () => {
    try {
      if (editando) { await api.actualizarCategoria(editando.id, form); toast.success('Actualizada'); }
      else { await api.crearCategoria(form); toast.success('Creada'); }
      setForm({ nombre: '', descripcion: '' }); setEditando(null); cargar();
    } catch (e) { toast.error('Error'); }
  };
  const editar = (c) => { setEditando(c); setForm({ nombre: c.nombre, descripcion: c.descripcion || '' }); };
  const eliminar = (id) => { api.eliminarCategoria(id).then(cargar); };
  return (
    <div style={S.grid(2)}>
      <div style={S.card}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Categorías</div>
        <table style={S.table}>
          <thead><tr><th style={S.th}>Nombre</th><th style={S.th}>Productos</th><th style={S.th}></th></tr></thead>
          <tbody>
            {cats.map(c => (
              <tr key={c.id}>
                <td style={S.td}><div>{c.nombre}</div><div style={{ fontSize: 11, color: '#64748b' }}>{c.descripcion}</div></td>
                <td style={{ ...S.td, color: '#94a3b8' }}>{c.num_productos}</td>
                <td style={S.td}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button style={{ ...S.btn('ghost'), padding: '4px 8px' }} onClick={() => editar(c)}><Icon name="edit" size={12} /></button>
                    <button style={{ ...S.btn('danger'), padding: '4px 8px' }} onClick={() => eliminar(c.id)}><Icon name="trash" size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={S.card}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{editando ? 'Editar' : 'Nueva'} Categoría</div>
        <div style={S.formGroup}><label style={S.label}>Nombre *</label><input style={S.input} value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} /></div>
        <div style={S.formGroup}><label style={S.label}>Descripción</label><input style={S.input} value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} /></div>
        <div style={{ display: 'flex', gap: 8 }}>
          {editando && <button style={S.btn('ghost')} onClick={() => { setEditando(null); setForm({ nombre: '', descripcion: '' }); }}>Cancelar</button>}
          <button style={S.btn('success')} onClick={guardar}><Icon name="check" size={14} /> {editando ? 'Actualizar' : 'Crear'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
function Configuracion() {
  const [cfg, setCfg] = useState({});
  const [saving, setSaving] = useState(false);
  useEffect(() => { api.getConfiguracion().then(d => d && setCfg(d)).catch(() => {}); }, []);
  const guardar = async () => {
    setSaving(true);
    try { await api.guardarConfiguracion(cfg); toast.success('Configuración guardada'); }
    catch (e) { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };
  const field = (label, key, type = 'text', placeholder = '') => (
    <div style={S.formGroup}>
      <label style={S.label}>{label}</label>
      <input type={type} style={S.input} value={cfg[key] || ''} placeholder={placeholder} onChange={e => setCfg(p => ({ ...p, [key]: e.target.value }))} />
    </div>
  );
  return (
    <div>
      <div style={S.grid(2)}>
        <div style={S.card}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 14 }}>DATOS DE LA EMPRESA</div>
          {field('RUC *', 'ruc', 'text', '20123456789')}
          {field('Razón Social *', 'razon_social', 'text', 'MI EMPRESA SAC')}
          {field('Nombre Comercial', 'nombre_comercial')}
          {field('Dirección Fiscal *', 'direccion')}
          {field('Email', 'email', 'email')}
          {field('Teléfono', 'telefono')}
        </div>
        <div style={S.card}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 14 }}>SERIES Y NUMERACIÓN</div>
          {field('Serie Boleta', 'serie_boleta', 'text', 'B001')}
          {field('Serie Factura', 'serie_factura', 'text', 'F001')}
          {field('Serie Nota Crédito', 'serie_nota_credito', 'text', 'BC01')}
          {field('% IGV', 'igv_porcentaje', 'number')}
          <div style={S.formGroup}>
            <label style={S.label}>Ambiente</label>
            <select style={S.select} value={cfg.ambiente || 'beta'} onChange={e => setCfg(p => ({ ...p, ambiente: e.target.value }))}>
              <option value="beta">BETA / Pruebas</option>
              <option value="produccion">Producción</option>
            </select>
          </div>
        </div>
      </div>
      <div style={S.card}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 14 }}>API DE FACTURACIÓN ELECTRÓNICA</div>
        <div style={{ background: '#0f1117', borderRadius: 8, padding: '12px 16px', marginBottom: 14, fontSize: 12, color: '#f59e0b', border: '1px solid #854d0e' }}>
          ⚠ Para emitir comprobantes reales a SUNAT necesitas configurar una API de facturación.
          Recomendamos <strong>Nubefact</strong> (nubefact.com) o <strong>Facturalo.pe</strong>. Ambas tienen plan gratuito para pruebas.
        </div>
        <div style={S.grid(2)}>
          <div>
            <div style={S.formGroup}>
              <label style={S.label}>Proveedor API</label>
              <select style={S.select} value={cfg.api_facturacion || 'nubefact'} onChange={e => setCfg(p => ({ ...p, api_facturacion: e.target.value }))}>
                <option value="nubefact">Nubefact</option>
                <option value="facturalope">Facturalo.pe</option>
              </select>
            </div>
            {field('Token / API Key', 'nubefact_token', 'password', 'Tu token de Nubefact')}
            {field('RUC en Nubefact', 'nubefact_ruc', 'text', '20123456789')}
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>APIS CONSULTA RUC/DNI (RENIEC)</div>
            <div style={{ background: '#0f1117', borderRadius: 6, padding: '10px 12px', fontSize: 12, color: '#64748b', marginBottom: 12 }}>
              El sistema usa automáticamente múltiples APIs gratuitas para consultar RUC y DNI. Para mayor estabilidad, registra tokens en:
              <ul style={{ margin: '8px 0 0', paddingLeft: 16 }}>
                <li><a href="https://dniruc.apisperu.com" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>dniruc.apisperu.com</a></li>
                <li><a href="https://apis.net.pe" target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>apis.net.pe</a></li>
              </ul>
            </div>
            {field('Token ApisPeru.com', 'apisperu_token', 'password')}
            {field('Token Apis.net.pe', 'apisnetpe_token', 'password')}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <button style={S.btn('success')} onClick={guardar} disabled={saving}><Icon name="check" size={14} /> {saving ? 'Guardando...' : 'Guardar Configuración'}</button>
      </div>
    </div>
  );
}

// ─── CONSULTAS RUC/DNI ────────────────────────────────────────────────────────
function ConsultasPage() {
  const [tipoBusq, setTipoBusq] = useState('DNI');
  const [num, setNum] = useState('');
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);

  const consultar = async () => {
    if (!num) return;
    setLoading(true); setRes(null);
    try {
      const data = tipoBusq === 'DNI' ? await api.consultarDNI(num) : await api.consultarRUC(num);
      setRes(data);
    } catch (e) { toast.error(e.response?.data?.error || 'Error de consulta'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={S.card}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 16 }}>CONSULTA RENIEC / SUNAT</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={S.label}>Tipo</label>
            <select style={{ ...S.select, width: 100 }} value={tipoBusq} onChange={e => { setTipoBusq(e.target.value); setNum(''); setRes(null); }}>
              <option>DNI</option><option>RUC</option>
            </select>
          </div>
          <div style={{ flex: 1, maxWidth: 240 }}>
            <label style={S.label}>Número de {tipoBusq}</label>
            <input style={S.input} value={num} onChange={e => setNum(e.target.value)} onKeyDown={e => e.key === 'Enter' && consultar()} placeholder={tipoBusq === 'DNI' ? '12345678' : '20123456789'} maxLength={tipoBusq === 'DNI' ? 8 : 11} />
          </div>
          <button style={S.btn()} onClick={consultar} disabled={loading}>
            <Icon name="search" size={14} /> {loading ? 'Consultando...' : `Consultar ${tipoBusq}`}
          </button>
        </div>

        {res && (
          <div style={{ marginTop: 20, background: '#0f1117', borderRadius: 10, padding: '20px 24px', border: '1px solid #1e2535' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>RESULTADO</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#34d399', marginBottom: 8 }}>{res.nombre || res.razon_social}</div>
            {tipoBusq === 'RUC' && (
              <div style={S.grid(2)}>
                {[
                  ['RUC', res.numero],
                  ['Nombre Comercial', res.nombre_comercial || '—'],
                  ['Estado SUNAT', res.estado || '—'],
                  ['Condición', res.condicion || '—'],
                  ['Dirección', res.direccion || '—'],
                ].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{l}</div>
                    <div style={{ fontSize: 13, color: '#e2e8f0', marginBottom: 8 }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
            {tipoBusq === 'DNI' && (
              <div style={S.grid(2)}>
                {[
                  ['DNI', res.numero],
                  ['Nombres', res.nombres || '—'],
                  ['Ap. Paterno', res.apellido_paterno || '—'],
                  ['Ap. Materno', res.apellido_materno || '—'],
                ].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{l}</div>
                    <div style={{ fontSize: 13, color: '#e2e8f0', marginBottom: 8 }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
            {res.demo && <div style={{ marginTop: 8, fontSize: 12, color: '#f59e0b', background: '#451a0322', border: '1px solid #854d0e', padding: '6px 12px', borderRadius: 6 }}>⚠ Modo demo — configure tokens API en Configuración para consultas reales a RENIEC/SUNAT</div>}
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>Fuente: {res.fuente}</div>
          </div>
        )}
      </div>
    </div>
  );
}


// ─── ESQUEMA BD ───────────────────────────────────────────────────────────────
function EsquemaBD() {
  const tablas = [
    {
      nombre: 'configuracion',
      desc: 'Datos de tu empresa y credenciales API',
      color: '#60a5fa',
      campos: [
        { nombre: 'id', tipo: 'INT AUTO_INCREMENT', desc: 'Clave primaria' },
        { nombre: 'ruc', tipo: 'VARCHAR(11)', desc: 'RUC de la empresa' },
        { nombre: 'razon_social', tipo: 'VARCHAR(200)', desc: 'Razón social' },
        { nombre: 'nombre_comercial', tipo: 'VARCHAR(200)', desc: 'Nombre comercial' },
        { nombre: 'direccion', tipo: 'VARCHAR(300)', desc: 'Dirección fiscal' },
        { nombre: 'email', tipo: 'VARCHAR(100)', desc: 'Email de contacto' },
        { nombre: 'telefono', tipo: 'VARCHAR(20)', desc: 'Teléfono' },
        { nombre: 'igv_porcentaje', tipo: 'DECIMAL(5,2)', desc: 'Porcentaje IGV (18.00)' },
        { nombre: 'serie_boleta', tipo: 'VARCHAR(4)', desc: 'Serie boletas (B001)' },
        { nombre: 'serie_factura', tipo: 'VARCHAR(4)', desc: 'Serie facturas (F001)' },
        { nombre: 'serie_nota_credito', tipo: 'VARCHAR(4)', desc: 'Serie notas crédito (BC01)' },
        { nombre: 'correlativo_boleta', tipo: 'INT', desc: 'Último correlativo boleta' },
        { nombre: 'correlativo_factura', tipo: 'INT', desc: 'Último correlativo factura' },
        { nombre: 'correlativo_nota_credito', tipo: 'INT', desc: 'Último correlativo NC' },
        { nombre: 'ambiente', tipo: 'VARCHAR(10)', desc: 'beta / produccion' },
        { nombre: 'miapi_token', tipo: 'VARCHAR(100)', desc: 'Token miapi.cloud' },
        { nombre: 'miapi_clave', tipo: 'VARCHAR(100)', desc: 'Clave secreta miapi.cloud' },
        { nombre: 'miapi_ruc', tipo: 'VARCHAR(11)', desc: 'RUC registrado en miapi.cloud' },
      ]
    },
    {
      nombre: 'categorias',
      desc: 'Categorías de productos',
      color: '#a78bfa',
      campos: [
        { nombre: 'id', tipo: 'INT AUTO_INCREMENT', desc: 'Clave primaria' },
        { nombre: 'nombre', tipo: 'VARCHAR(100) UNIQUE', desc: 'Nombre de categoría' },
        { nombre: 'descripcion', tipo: 'VARCHAR(300)', desc: 'Descripción' },
        { nombre: 'activo', tipo: 'BOOLEAN', desc: '1=activo, 0=inactivo' },
        { nombre: 'created_at', tipo: 'TIMESTAMP', desc: 'Fecha de creación' },
      ]
    },
    {
      nombre: 'productos',
      desc: 'Catálogo de productos y servicios',
      color: '#34d399',
      campos: [
        { nombre: 'id', tipo: 'INT AUTO_INCREMENT', desc: 'Clave primaria' },
        { nombre: 'codigo', tipo: 'VARCHAR(50) UNIQUE', desc: 'Código del producto' },
        { nombre: 'nombre', tipo: 'VARCHAR(200)', desc: 'Nombre del producto' },
        { nombre: 'descripcion', tipo: 'TEXT', desc: 'Descripción detallada' },
        { nombre: 'categoria_id', tipo: 'INT FK→categorias', desc: 'Categoría del producto' },
        { nombre: 'tipo', tipo: "ENUM('producto','servicio')", desc: 'Tipo de ítem' },
        { nombre: 'unidad_medida', tipo: 'VARCHAR(10)', desc: 'NIU, KGM, HUR, LTR...' },
        { nombre: 'precio_unitario', tipo: 'DECIMAL(12,6)', desc: 'Precio sin IGV' },
        { nombre: 'precio_con_igv', tipo: 'DECIMAL(12,2)', desc: 'Precio con IGV incluido' },
        { nombre: 'afecto_igv', tipo: 'BOOLEAN', desc: '1=gravado, 0=exonerado' },
        { nombre: 'stock', tipo: 'DECIMAL(12,2)', desc: 'Stock actual' },
        { nombre: 'stock_minimo', tipo: 'DECIMAL(12,2)', desc: 'Stock mínimo de alerta' },
        { nombre: 'activo', tipo: 'BOOLEAN', desc: '1=activo, 0=inactivo' },
      ]
    },
    {
      nombre: 'clientes',
      desc: 'Clientes registrados',
      color: '#f59e0b',
      campos: [
        { nombre: 'id', tipo: 'INT AUTO_INCREMENT', desc: 'Clave primaria' },
        { nombre: 'tipo_documento', tipo: "ENUM('DNI','RUC','CE','PASAPORTE')", desc: 'Tipo de documento' },
        { nombre: 'numero_documento', tipo: 'VARCHAR(20)', desc: 'Número de documento' },
        { nombre: 'nombre', tipo: 'VARCHAR(200)', desc: 'Nombre o razón social' },
        { nombre: 'direccion', tipo: 'VARCHAR(300)', desc: 'Dirección del cliente' },
        { nombre: 'email', tipo: 'VARCHAR(100)', desc: 'Correo electrónico' },
        { nombre: 'telefono', tipo: 'VARCHAR(20)', desc: 'Teléfono' },
        { nombre: 'activo', tipo: 'BOOLEAN', desc: '1=activo, 0=inactivo' },
      ]
    },
    {
      nombre: 'comprobantes',
      desc: 'Boletas, Facturas y Notas de Crédito emitidas',
      color: '#f87171',
      campos: [
        { nombre: 'id', tipo: 'INT AUTO_INCREMENT', desc: 'Clave primaria' },
        { nombre: 'uuid', tipo: 'VARCHAR(36) UNIQUE', desc: 'Identificador único' },
        { nombre: 'tipo_comprobante', tipo: "ENUM('01','03','07','08')", desc: '01=Factura 03=Boleta 07=NC 08=ND' },
        { nombre: 'serie', tipo: 'VARCHAR(4)', desc: 'Serie (F001, B001, BC01)' },
        { nombre: 'correlativo', tipo: 'INT', desc: 'Número correlativo' },
        { nombre: 'numero_completo', tipo: 'VARCHAR(20)', desc: 'Ej: F001-00000001' },
        { nombre: 'fecha_emision', tipo: 'DATE', desc: 'Fecha del comprobante' },
        { nombre: 'moneda', tipo: 'VARCHAR(3)', desc: 'PEN / USD' },
        { nombre: 'cliente_id', tipo: 'INT FK→clientes', desc: 'Cliente asociado' },
        { nombre: 'cliente_tipo_doc', tipo: 'VARCHAR(10)', desc: 'DNI o RUC del cliente' },
        { nombre: 'cliente_num_doc', tipo: 'VARCHAR(20)', desc: 'Número de documento cliente' },
        { nombre: 'cliente_nombre', tipo: 'VARCHAR(200)', desc: 'Nombre del cliente' },
        { nombre: 'cliente_direccion', tipo: 'VARCHAR(300)', desc: 'Dirección del cliente' },
        { nombre: 'subtotal', tipo: 'DECIMAL(12,2)', desc: 'Subtotal (base+exonerado)' },
        { nombre: 'base_imponible', tipo: 'DECIMAL(12,2)', desc: 'Base gravada para IGV' },
        { nombre: 'igv', tipo: 'DECIMAL(12,2)', desc: 'Monto IGV' },
        { nombre: 'total', tipo: 'DECIMAL(12,2)', desc: 'Total a pagar' },
        { nombre: 'op_gravada', tipo: 'DECIMAL(12,2)', desc: 'Operaciones gravadas' },
        { nombre: 'op_exonerada', tipo: 'DECIMAL(12,2)', desc: 'Operaciones exoneradas' },
        { nombre: 'op_inafecta', tipo: 'DECIMAL(12,2)', desc: 'Operaciones inafectas' },
        { nombre: 'estado', tipo: "ENUM('PENDIENTE','ACEPTADO','RECHAZADO','ANULADO')", desc: 'Estado SUNAT' },
        { nombre: 'sunat_mensaje', tipo: 'TEXT', desc: 'Respuesta de SUNAT/miapi' },
        { nombre: 'enlace_pdf_a4', tipo: 'TEXT', desc: '🔗 Link PDF tamaño A4 (miapi.cloud)' },
        { nombre: 'enlace_pdf_ticket', tipo: 'TEXT', desc: '🔗 Link PDF tamaño Ticket (miapi.cloud)' },
        { nombre: 'enlace_xml_firmado', tipo: 'TEXT', desc: '🔗 Link XML firmado digitalmente (miapi.cloud)' },
        { nombre: 'enlace_xml_sin_firmar', tipo: 'TEXT', desc: '🔗 Link XML sin firmar (miapi.cloud)' },
        { nombre: 'hash_cpe', tipo: 'VARCHAR(100)', desc: 'Hash del comprobante electrónico' },
        { nombre: 'nombre_archivo', tipo: 'VARCHAR(100)', desc: 'Nombre archivo Ej: 10777923761-01-F001-1' },
        { nombre: 'es_canje', tipo: 'BOOLEAN', desc: '1=es canje de boleta a factura' },
        { nombre: 'comprobante_origen_id', tipo: 'INT FK→comprobantes', desc: 'Comprobante original (canje/NC)' },
        { nombre: 'motivo_nc', tipo: 'VARCHAR(200)', desc: 'Motivo nota de crédito' },
        { nombre: 'tipo_nota_credito', tipo: 'VARCHAR(5)', desc: 'Código tipo NC (01=anulación)' },
        { nombre: 'observaciones', tipo: 'TEXT', desc: 'Observaciones adicionales' },
      ]
    },
    {
      nombre: 'comprobante_items',
      desc: 'Líneas de detalle de cada comprobante',
      color: '#94a3b8',
      campos: [
        { nombre: 'id', tipo: 'INT AUTO_INCREMENT', desc: 'Clave primaria' },
        { nombre: 'comprobante_id', tipo: 'INT FK→comprobantes', desc: 'Comprobante al que pertenece' },
        { nombre: 'producto_id', tipo: 'INT FK→productos', desc: 'Producto asociado (opcional)' },
        { nombre: 'descripcion', tipo: 'VARCHAR(300)', desc: 'Descripción del ítem' },
        { nombre: 'unidad_medida', tipo: 'VARCHAR(10)', desc: 'NIU, KGM, HUR, etc.' },
        { nombre: 'cantidad', tipo: 'DECIMAL(12,2)', desc: 'Cantidad vendida' },
        { nombre: 'precio_unitario', tipo: 'DECIMAL(12,6)', desc: 'Precio sin IGV por unidad' },
        { nombre: 'precio_con_igv', tipo: 'DECIMAL(12,2)', desc: 'Precio con IGV por unidad' },
        { nombre: 'descuento', tipo: 'DECIMAL(12,2)', desc: 'Descuento aplicado' },
        { nombre: 'afecto_igv', tipo: 'BOOLEAN', desc: '1=gravado, 0=exonerado' },
        { nombre: 'base_imponible', tipo: 'DECIMAL(12,2)', desc: 'Base para calcular IGV' },
        { nombre: 'igv', tipo: 'DECIMAL(12,2)', desc: 'Monto IGV del ítem' },
        { nombre: 'total_item', tipo: 'DECIMAL(12,2)', desc: 'Total del ítem' },
        { nombre: 'orden', tipo: 'INT', desc: 'Orden en el comprobante' },
      ]
    },
  ];

  const [tablaActiva, setTablaActiva] = React.useState('comprobantes');
  const tabla = tablas.find(t => t.nombre === tablaActiva);

  return (
    <div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
        Base de datos MySQL — <span style={{ color: '#34d399' }}>facturacion</span> — {tablas.length} tablas
      </div>

      {/* Selector de tablas */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {tablas.map(t => (
          <button key={t.nombre} onClick={() => setTablaActiva(t.nombre)}
            style={{ ...S.btn(tablaActiva === t.nombre ? 'primary' : 'ghost'), fontSize: 12,
              borderColor: tablaActiva === t.nombre ? t.color : undefined,
              background: tablaActiva === t.nombre ? t.color + '22' : undefined,
              color: tablaActiva === t.nombre ? t.color : '#94a3b8' }}>
            {t.nombre}
            <span style={{ fontSize: 10, color: tablaActiva === t.nombre ? t.color : '#64748b', marginLeft: 4 }}>
              ({t.campos.length})
            </span>
          </button>
        ))}
      </div>

      {/* Detalle tabla */}
      {tabla && (
        <div style={S.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: tabla.color }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: tabla.color, fontFamily: 'monospace' }}>{tabla.nombre}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{tabla.desc}</div>
            </div>
          </div>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Campo</th>
                <th style={S.th}>Tipo MySQL</th>
                <th style={S.th}>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {tabla.campos.map((c, i) => (
                <tr key={i}>
                  <td style={{ ...S.td, fontFamily: 'monospace', fontSize: 12, color: c.nombre === 'id' ? '#f59e0b' : c.nombre.includes('_id') || c.nombre.includes('FK') ? '#a78bfa' : c.nombre.startsWith('enlace_') ? '#34d399' : '#e2e8f0' }}>
                    {c.nombre.startsWith('enlace_') ? '🔗 ' : ''}{c.nombre}
                    {c.nombre === 'id' && <span style={{ fontSize: 9, background: '#854d0e', color: '#fef08a', padding: '1px 4px', borderRadius: 3, marginLeft: 4 }}>PK</span>}
                    {c.tipo.includes('FK') && <span style={{ fontSize: 9, background: '#4c1d95', color: '#c4b5fd', padding: '1px 4px', borderRadius: 3, marginLeft: 4 }}>FK</span>}
                  </td>
                  <td style={{ ...S.td, fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>
                    {c.tipo.replace(' FK→'+c.tipo.split('FK→')[1], '')}
                    {c.tipo.includes('FK→') && <span style={{ color: '#a78bfa' }}> → {c.tipo.split('FK→')[1]}</span>}
                  </td>
                  <td style={{ ...S.td, fontSize: 12, color: c.nombre.startsWith('enlace_') ? '#34d399' : '#94a3b8' }}>{c.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* SQL CREATE para copiar */}
          <div style={{ marginTop: 16, background: '#0f1117', borderRadius: 8, padding: '12px 16px' }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>Query útil en MySQL Workbench:</div>
            <code style={{ fontSize: 11, color: '#34d399', display: 'block', lineHeight: 1.8 }}>
              SELECT * FROM facturacion.{tabla.nombre} ORDER BY id DESC LIMIT 50;
            </code>
            {tabla.nombre === 'comprobantes' && (
              <code style={{ fontSize: 11, color: '#60a5fa', display: 'block', marginTop: 8, lineHeight: 1.8 }}>
                {`SELECT numero_completo, cliente_nombre, total, estado, enlace_pdf_a4, enlace_pdf_ticket, enlace_xml_firmado, enlace_xml_sin_firmar FROM facturacion.comprobantes ORDER BY id DESC;`}
              </code>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const PAGES = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home' },
  { id: 'comprobantes', label: 'Comprobantes', icon: 'file' },
  { id: 'productos', label: 'Productos', icon: 'package' },
  { id: 'categorias', label: 'Categorías', icon: 'tag' },
  { id: 'consultas', label: 'Consulta RUC/DNI', icon: 'search' },
  { id: 'configuracion', label: 'Configuración', icon: 'settings' },
  { id: 'esquema', label: 'Esquema BD', icon: 'barChart' },
];

const PAGE_TITLES = { esquema: 'Esquema Base de Datos MySQL', dashboard: 'Dashboard', comprobantes: 'Comprobantes', productos: 'Productos', categorias: 'Categorías', consultas: 'Consulta RUC / DNI', configuracion: 'Configuración' };

export default function App() {
  const [page, setPage] = useState('dashboard');
  return (
    <div style={S.app}>
      <div style={S.sidebar}>
        <div style={S.sidebarLogo}>
          <div style={S.logoText}>FACTURAPY</div>
          <div style={S.logoSub}>Facturación Electrónica Perú</div>
        </div>
        <nav style={S.nav}>
          {PAGES.map(p => (
            <div key={p.id} style={S.navItem(page === p.id)} onClick={() => setPage(p.id)}>
              <Icon name={p.icon} size={15} />
              <span>{p.label}</span>
            </div>
          ))}
        </nav>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #1e2535', fontSize: 11, color: '#374151' }}>
          v1.0 · Perú 2024
        </div>
      </div>
      <div style={S.main}>
        <div style={S.topbar}>
          <span style={S.topTitle}>{PAGE_TITLES[page]}</span>
          <div style={{ fontSize: 12, color: '#374151' }}>🇵🇪 Sistema de Facturación Electrónica SUNAT</div>
        </div>
        <div style={S.content}>
          {page === 'dashboard' && <Dashboard onNav={setPage} />}
          {page === 'comprobantes' && <Comprobantes />}
          {page === 'productos' && <Productos />}
          {page === 'categorias' && <Categorias />}
          {page === 'consultas' && <ConsultasPage />}
          {page === 'configuracion' && <Configuracion />}
          {page === 'esquema' && <EsquemaBD />}
        </div>
      </div>
    </div>
  );
}
