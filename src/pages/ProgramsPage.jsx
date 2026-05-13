import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Plus, X, Loader2, Search, Edit2, Trash2, Zap, Wallet, Activity } from 'lucide-react';
import { programApi } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const STATUS_COLORS = { ACTIVE: 'from-emerald-500 to-teal-600', INACTIVE: 'from-slate-400 to-slate-500', COMPLETED: 'from-blue-500 to-indigo-600', CANCELLED: 'from-rose-500 to-red-600', DRAFT: 'from-amber-400 to-orange-500' };
const BLANK = { title: '', description: '', budget: '', status: 'DRAFT', startDate: '', endDate: '' };

export default function ProgramsPage() {
  const role = localStorage.getItem('role') || 'TOURIST';
  const isStaff = ['ADMIN', 'MANAGER'].includes(role);

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [budgetModal, setBudgetModal] = useState(null);
  const [budgetData, setBudgetData] = useState(null);

  const showMsg = (msg, type = 'success') => { setAlert({ msg, type }); setTimeout(() => setAlert(null), 3500); };

  const fetchAll = async () => {
    setLoading(true);
    try { const res = await programApi.getAll(); setPrograms(res.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, budget: form.budget ? parseFloat(form.budget) : null };
      if (editId) { await programApi.update(editId, payload); showMsg('Program updated!'); }
      else { await programApi.create(payload); showMsg('Program created!'); }
      setShowForm(false); setForm(BLANK); setEditId(null); fetchAll();
    } catch (e) { showMsg('Operation failed.', 'error'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this program?')) return;
    try { await programApi.delete(id); showMsg('Deleted.'); fetchAll(); }
    catch (e) { showMsg('Delete failed.', 'error'); }
  };

  const openBudget = async (p) => {
    setBudgetModal(p);
    try { const res = await programApi.getBudgetReport(p.programId); setBudgetData(res.data); }
    catch (e) { setBudgetData(null); }
  };

  const openEdit = (p) => {
    setForm({ title: p.title || '', description: p.description || '', budget: p.budget || '', status: p.status || 'DRAFT', startDate: p.startDate || '', endDate: p.endDate || '' });
    setEditId(p.programId); setShowForm(true);
  };

  const filtered = programs.filter(p => (p.title || '').toLowerCase().includes(search.toLowerCase()));

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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
          <div>
            <span className="text-[10px] font-black text-[#FF6D00] uppercase tracking-[0.5em] mb-2 block">Ministry of Tourism</span>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#1A237E] leading-none">
              Tourism<br /><span className="text-[#FF6D00]">Programs.</span>
            </h1>
          </div>
          {isStaff && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setShowForm(true); setEditId(null); setForm(BLANK); }}
              className="flex items-center gap-3 bg-[#1A237E] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-300/30">
              <Plus size={18} /> New Program
            </motion.button>
          )}
        </div>

        <div className="relative max-w-sm mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search programs..."
            className="w-full pl-11 pr-5 py-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm text-sm font-medium outline-none focus:border-[#FF6D00] transition-all" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32"><Loader2 className="animate-spin text-[#FF6D00]" size={44} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.map((p, i) => (
                <motion.div key={p.programId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }} className="bg-white rounded-3xl overflow-hidden border border-slate-50 shadow-lg">
                  <div className={`h-2 bg-gradient-to-r ${STATUS_COLORS[p.status] || 'from-slate-400 to-slate-500'}`} />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-black text-[#1A237E] text-base uppercase tracking-tight leading-tight flex-1 pr-2">{p.title}</h3>
                      <span className={`text-[8px] font-black text-white px-2.5 py-1 rounded-full uppercase tracking-widest bg-gradient-to-r ${STATUS_COLORS[p.status] || 'from-slate-400 to-slate-500'}`}>{p.status}</span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2 mb-4">{p.description || 'No description.'}</p>
                    {p.budget && (
                      <div className="flex items-center gap-2 text-xs font-black text-emerald-600 mb-2">
                        <Wallet size={14} />₹{Number(p.budget).toLocaleString('en-IN')}
                      </div>
                    )}
                    {p.startDate && <p className="text-[10px] text-slate-400 font-bold">Start: {new Date(p.startDate).toLocaleDateString('en-IN')}</p>}
                    {isStaff && (
                      <div className="flex gap-2 mt-5 pt-5 border-t border-slate-50">
                        <button onClick={() => openBudget(p)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 rounded-xl text-xs font-black text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"><Activity size={13} />Budget</button>
                        <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#F8F9FF] rounded-xl text-xs font-black text-[#1A237E] hover:bg-[#1A237E] hover:text-white transition-all"><Edit2 size={13} />Edit</button>
                        <button onClick={() => handleDelete(p.programId)} className="flex items-center justify-center py-2.5 px-3 bg-rose-50 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={13} /></button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && !loading && (
              <div className="col-span-3 py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                <Globe size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="font-black text-slate-300 uppercase text-xs tracking-widest">No programs found</p>
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
              <h2 className="text-2xl font-black text-[#1A237E] uppercase tracking-tighter mb-6">{editId ? 'Edit Program' : 'New Program'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {[['title', 'Program Title *', 'text'], ['description', 'Description', 'text'], ['budget', 'Budget (₹)', 'number'], ['startDate', 'Start Date', 'date'], ['endDate', 'End Date', 'date']].map(([field, label, type]) => (
                  <div key={field}>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{label}</label>
                    <input type={type} required={field === 'title'} value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-sm font-medium focus:outline-none focus:border-[#FF6D00] transition-all" />
                  </div>
                ))}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-sm font-medium focus:outline-none focus:border-[#FF6D00] transition-all">
                    {['DRAFT', 'ACTIVE', 'INACTIVE', 'COMPLETED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={saving}
                  className="w-full py-4 bg-gradient-to-r from-[#1A237E] to-[#FF6D00] text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:opacity-90 transition-all disabled:opacity-60">
                  {saving ? 'Saving...' : editId ? 'Update Program' : 'Create Program'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Budget Modal */}
      <AnimatePresence>
        {budgetModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setBudgetModal(null); setBudgetData(null); }} className="absolute inset-0 bg-[#1A237E]/60 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl z-10">
              <button onClick={() => { setBudgetModal(null); setBudgetData(null); }} className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-rose-100 transition-all"><X size={18} /></button>
              <h2 className="text-xl font-black text-[#1A237E] uppercase tracking-tighter mb-2">{budgetModal.title}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Budget Report</p>
              {budgetData ? (
                <div className="space-y-3">
                  {Object.entries(budgetData).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between bg-slate-50 rounded-2xl px-5 py-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-black text-[#1A237E] text-sm">{typeof v === 'number' ? `₹${v.toLocaleString('en-IN')}` : String(v)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-300 font-black uppercase text-xs tracking-widest">No budget data available</div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}
