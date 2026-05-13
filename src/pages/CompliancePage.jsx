import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Plus, X, Loader2, Search, Edit2, Trash2, Zap, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { complianceApi } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const RESULT_STYLE = { PASS: 'bg-emerald-100 text-emerald-700', FAIL: 'bg-rose-100 text-rose-700', PENDING: 'bg-amber-100 text-amber-700', COMPLIANT: 'bg-blue-100 text-blue-700', NON_COMPLIANT: 'bg-rose-100 text-rose-700' };
const BLANK = { referenceNumber: '', checkType: '', entityType: '', entityId: '', result: 'PENDING', notes: '' };

export default function CompliancePage() {
  const role = localStorage.getItem('role') || 'TOURIST';
  const isStaff = ['ADMIN', 'COMPLIANCE', 'AUDITOR', 'OFFICER'].includes(role);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const showMsg = (msg, type = 'success') => { setAlert({ msg, type }); setTimeout(() => setAlert(null), 3500); };

  const fetchAll = async () => {
    setLoading(true);
    try { const res = await complianceApi.getAll({ page: 0, size: 50 }); setRecords(res.data?.content || res.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await complianceApi.create(form);
      showMsg('Compliance record logged!');
      setShowForm(false); setForm(BLANK); fetchAll();
    } catch (e) { showMsg('Failed to log record.', 'error'); } finally { setSaving(false); }
  };

  const handleUpdateResult = async (id, result) => {
    try { await complianceApi.updateResult(id, result); showMsg('Result updated!'); fetchAll(); }
    catch (e) { showMsg('Update failed.', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete record?')) return;
    try { await complianceApi.delete(id); showMsg('Deleted.'); fetchAll(); }
    catch (e) { showMsg('Delete failed.', 'error'); }
  };

  const filtered = records.filter(r =>
    (r.referenceNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.checkType || '').toLowerCase().includes(search.toLowerCase())
  );

  const stats = { total: records.length, pass: records.filter(r => r.result === 'PASS' || r.result === 'COMPLIANT').length, fail: records.filter(r => r.result === 'FAIL' || r.result === 'NON_COMPLIANT').length, pending: records.filter(r => r.result === 'PENDING').length };

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
            <span className="text-[10px] font-black text-[#FF6D00] uppercase tracking-[0.5em] mb-2 block">Governance & Audit</span>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#1A237E] leading-none">
              Compliance<br /><span className="text-[#FF6D00]">Registry.</span>
            </h1>
          </div>
          {isStaff && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setShowForm(true); setForm(BLANK); }}
              className="flex items-center gap-3 bg-[#1A237E] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-300/30">
              <Plus size={18} /> Log Check
            </motion.button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Records', value: stats.total, color: 'from-[#1A237E] to-indigo-700', icon: <ShieldCheck size={20} /> },
            { label: 'Passed', value: stats.pass, color: 'from-emerald-500 to-teal-600', icon: <CheckCircle size={20} /> },
            { label: 'Failed', value: stats.fail, color: 'from-rose-500 to-red-600', icon: <AlertTriangle size={20} /> },
            { label: 'Pending', value: stats.pending, color: 'from-amber-400 to-orange-500', icon: <Clock size={20} /> },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl p-5 shadow-lg border border-slate-50">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-3`}>{s.icon}</div>
              <p className="text-2xl font-black text-[#1A237E]">{s.value}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search records..."
            className="w-full pl-11 pr-5 py-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm text-sm font-medium outline-none focus:border-[#FF6D00] transition-all" />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-32"><Loader2 className="animate-spin text-[#FF6D00]" size={44} /></div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-[#1A237E] to-[#283593] text-white">
                    {['Ref #', 'Check Type', 'Entity', 'Result', 'Notes', isStaff ? 'Actions' : ''].filter(Boolean).map(h => (
                      <th key={h} className="text-left px-6 py-4 text-[9px] font-black uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((r, i) => (
                      <motion.tr key={r.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.04 }}
                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                        <td className="px-6 py-4 font-black text-[#1A237E] text-xs">{r.referenceNumber || '—'}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-600">{r.checkType || '—'}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-500">{r.entityType} {r.entityId ? `#${r.entityId}` : ''}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${RESULT_STYLE[r.result] || 'bg-slate-100 text-slate-600'}`}>{r.result}</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400 max-w-[200px] truncate">{r.notes || '—'}</td>
                        {isStaff && (
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <select onChange={e => handleUpdateResult(r.id, e.target.value)} defaultValue={r.result}
                                className="text-[10px] font-black bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 focus:outline-none focus:border-[#FF6D00] cursor-pointer">
                                {['PENDING', 'PASS', 'FAIL', 'COMPLIANT', 'NON_COMPLIANT'].map(res => <option key={res} value={res}>{res}</option>)}
                              </select>
                              <button onClick={() => handleDelete(r.id)} className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={13} /></button>
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {filtered.length === 0 && !loading && (
                <div className="py-20 text-center text-slate-300 font-black uppercase text-xs tracking-widest">No compliance records found</div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="absolute inset-0 bg-[#1A237E]/60 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl z-10">
              <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-rose-100 transition-all"><X size={18} /></button>
              <h2 className="text-2xl font-black text-[#1A237E] uppercase tracking-tighter mb-6">Log Compliance Check</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {[['referenceNumber', 'Reference Number *', 'text'], ['checkType', 'Check Type *', 'text'], ['entityType', 'Entity Type', 'text'], ['entityId', 'Entity ID', 'number'], ['notes', 'Notes', 'text']].map(([field, label, type]) => (
                  <div key={field}>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{label}</label>
                    <input type={type} required={label.includes('*')} value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-sm font-medium focus:outline-none focus:border-[#FF6D00] transition-all" />
                  </div>
                ))}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Result</label>
                  <select value={form.result} onChange={e => setForm(p => ({ ...p, result: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-sm font-medium focus:outline-none focus:border-[#FF6D00] transition-all">
                    {['PENDING', 'PASS', 'FAIL', 'COMPLIANT', 'NON_COMPLIANT'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={saving}
                  className="w-full py-4 bg-gradient-to-r from-[#1A237E] to-[#FF6D00] text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:opacity-90 transition-all disabled:opacity-60">
                  {saving ? 'Saving...' : 'Log Compliance Check'}
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
