import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Search, Plus, X, Loader2, ChevronDown, Zap, Edit2, Trash2, ToggleLeft } from 'lucide-react';
import { eventApi, siteApi } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const STATUS_COLORS = { ACTIVE: 'bg-emerald-500', INACTIVE: 'bg-slate-400', CANCELLED: 'bg-rose-500', PENDING: 'bg-amber-500' };

const BLANK_FORM = { title: '', description: '', siteId: '', programId: '', startDate: '', endDate: '', maxCapacity: '', status: 'ACTIVE' };

export default function EventsPage() {
  const role = localStorage.getItem('role') || 'TOURIST';
  const isStaff = ['ADMIN', 'MANAGER', 'OFFICER'].includes(role);

  const [events, setEvents] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [evRes, siteRes] = await Promise.allSettled([eventApi.getAll(), siteApi.getAll()]);
      if (evRes.status === 'fulfilled') setEvents(evRes.value.data || []);
      if (siteRes.status === 'fulfilled') setSites(siteRes.value.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, siteId: form.siteId ? Number(form.siteId) : null, programId: form.programId ? Number(form.programId) : null, maxCapacity: form.maxCapacity ? Number(form.maxCapacity) : null };
      if (editId) { await eventApi.update(editId, payload); showAlert('Event updated!'); }
      else { await eventApi.create(payload); showAlert('Event created!'); }
      setShowForm(false); setForm(BLANK_FORM); setEditId(null);
      fetchAll();
    } catch (e) { showAlert('Operation failed. Check required fields.', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try { await eventApi.delete(id); showAlert('Event deleted.'); fetchAll(); }
    catch (e) { showAlert('Delete failed.', 'error'); }
  };

  const openEdit = (ev) => {
    setForm({ title: ev.title || '', description: ev.description || '', siteId: ev.siteId || '', programId: ev.programId || '', startDate: ev.startDate || '', endDate: ev.endDate || '', maxCapacity: ev.maxCapacity || '', status: ev.status || 'ACTIVE' });
    setEditId(ev.eventId); setShowForm(true);
  };

  const filtered = events.filter(ev => {
    const matchSearch = (ev.title || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || ev.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] via-[#fafbff] to-[#fff8f0] font-sans">
      <Navbar />
      <AnimatePresence>
        {alert && (
          <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
            className={`fixed top-6 right-6 z-[999] px-6 py-4 rounded-2xl text-white text-xs font-black uppercase tracking-widest shadow-2xl flex items-center gap-3 ${alert.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
            <Zap size={16} />{alert.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-28 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
          <div>
            <span className="text-[10px] font-black text-[#FF6D00] uppercase tracking-[0.5em] mb-2 block">Tourism Gov India</span>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#1A237E] leading-none">
              Cultural<br /><span className="text-[#FF6D00]">Events.</span>
            </h1>
          </div>
          {isStaff && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setShowForm(true); setEditId(null); setForm(BLANK_FORM); }}
              className="flex items-center gap-3 bg-[#FF6D00] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-300/30">
              <Plus size={18} /> New Event
            </motion.button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..."
              className="w-full pl-11 pr-5 py-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm text-sm font-medium outline-none focus:border-[#FF6D00] transition-all" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'ACTIVE', 'INACTIVE', 'CANCELLED', 'PENDING'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-[#1A237E] text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:border-[#1A237E]'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-32"><Loader2 className="animate-spin text-[#FF6D00]" size={44} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.map((ev, i) => (
                <motion.div key={ev.eventId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4, boxShadow: '0 20px 50px rgba(26,35,126,0.12)' }}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-50 shadow-lg group">
                  <div className="h-3 bg-gradient-to-r from-[#1A237E] to-[#FF6D00]" />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-black text-[#1A237E] text-base uppercase tracking-tight leading-tight flex-1 pr-3">{ev.title}</h3>
                      <span className={`text-[8px] font-black text-white px-2.5 py-1 rounded-full uppercase tracking-widest ${STATUS_COLORS[ev.status] || 'bg-slate-400'}`}>{ev.status}</span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2 mb-4">{ev.description || 'No description provided.'}</p>
                    <div className="space-y-2">
                      {ev.siteId && <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500"><MapPin size={12} className="text-[#FF6D00]" />Site #{ev.siteId}</div>}
                      {ev.startDate && <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500"><Calendar size={12} className="text-[#1A237E]" />{new Date(ev.startDate).toLocaleDateString('en-IN')}</div>}
                      {ev.maxCapacity && <div className="text-[10px] font-bold text-slate-500">Capacity: {ev.maxCapacity}</div>}
                    </div>
                    {isStaff && (
                      <div className="flex gap-2 mt-5 pt-5 border-t border-slate-50">
                        <button onClick={() => openEdit(ev)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#F8F9FF] rounded-xl text-xs font-black text-[#1A237E] hover:bg-[#1A237E] hover:text-white transition-all"><Edit2 size={13} />Edit</button>
                        <button onClick={() => handleDelete(ev.eventId)} className="flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-50 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={13} /></button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && !loading && (
              <div className="col-span-3 py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="font-black text-slate-300 uppercase text-xs tracking-widest">No events found</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="absolute inset-0 bg-[#1A237E]/60 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-rose-100 transition-all"><X size={18} /></button>
              <h2 className="text-2xl font-black text-[#1A237E] uppercase tracking-tighter mb-6">{editId ? 'Edit Event' : 'New Event'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {[['title', 'Event Title *', 'text'], ['description', 'Description', 'text'], ['startDate', 'Start Date', 'datetime-local'], ['endDate', 'End Date', 'datetime-local'], ['maxCapacity', 'Max Capacity', 'number']].map(([field, label, type]) => (
                  <div key={field}>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{label}</label>
                    <input type={type} required={field === 'title'} value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-sm font-medium focus:outline-none focus:border-[#FF6D00] transition-all" />
                  </div>
                ))}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Heritage Site</label>
                  <select value={form.siteId} onChange={e => setForm(p => ({ ...p, siteId: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-sm font-medium focus:outline-none focus:border-[#FF6D00] transition-all">
                    <option value="">Select Site</option>
                    {sites.map(s => <option key={s.siteId} value={s.siteId}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-sm font-medium focus:outline-none focus:border-[#FF6D00] transition-all">
                    {['ACTIVE', 'INACTIVE', 'CANCELLED', 'PENDING'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={saving}
                  className="w-full py-4 bg-gradient-to-r from-[#1A237E] to-[#FF6D00] text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:opacity-90 transition-all disabled:opacity-60">
                  {saving ? 'Saving...' : editId ? 'Update Event' : 'Create Event'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}
