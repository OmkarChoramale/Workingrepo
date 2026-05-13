import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Info, Loader2, ShieldAlert, Plus, X, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { siteService } from '../services/heritageService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const getSiteImage = (site) => {
    const text = `${site.name || ''} ${site.location || ''}`.toLowerCase();
    if (text.includes('taj') || text.includes('agra')) return 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80';
    if (text.includes('hampi') || text.includes('karnataka')) return 'https://images.unsplash.com/photo-1590136113060-f7e2e37f2db6?w=800&auto=format&fit=crop&q=80';
    if (text.includes('ajanta') || text.includes('ellora') || text.includes('aurangabad')) return 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&auto=format&fit=crop&q=80';
    if (text.includes('konark') || text.includes('odisha')) return 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&auto=format&fit=crop&q=80';
    if (text.includes('qutb') || text.includes('delhi')) return 'https://images.unsplash.com/photo-1597040663342-45b6af3d91a5?w=800&auto=format&fit=crop&q=80';
    if (text.includes('golconda') || text.includes('hyderabad') || text.includes('fort')) return 'https://images.unsplash.com/photo-1597040663342-45b6af3d91a5?w=800&auto=format&fit=crop&q=80';
    if (text.includes('temple') || text.includes('khajuraho')) return 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80';
    if (text.includes('palace') || text.includes('varanasi')) return 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&fit=crop&q=80';
    if (text.includes('cave')) return 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&auto=format&fit=crop&q=80';
    if (text.includes('unesco') || text.includes('ruins')) return 'https://images.unsplash.com/photo-1590136113060-f7e2e37f2db6?w=800&auto=format&fit=crop&q=80';
    return 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop&q=80';
};

const STATUS_COLOR = {
    OPEN: 'bg-emerald-500', ACTIVE: 'bg-emerald-500',
    CLOSED_FOR_MAINTENANCE: 'bg-amber-500', MAINTENANCE: 'bg-amber-500',
    PERMANENTLY_CLOSED: 'bg-rose-500', CLOSED: 'bg-rose-500',
    INACTIVE: 'bg-slate-400',
};

const BLANK_SITE = { name: '', description: '', location: '', status: 'OPEN' };

export default function TouristHeritageSites() {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(BLANK_SITE);
    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState(null);

    const role = localStorage.getItem('role') || 'TOURIST';
    const isStaff = ['ADMIN', 'OFFICER', 'MANAGER'].includes(role);

    const showMsg = (msg, type = 'success') => { setAlert({ msg, type }); setTimeout(() => setAlert(null), 3500); };

    const fetchAll = async () => {
        try {
            setError(null);
            const siteRes = await siteService.getAll();
            setSites(Array.isArray(siteRes.data) ? siteRes.data : []);
        } catch (err) {
            console.error('Heritage Site Fetch Error:', err);
            setError('Unable to load heritage sites. Ensure SiteService is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleCreateSite = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await siteService.create(form);
            showMsg('Heritage site created successfully!');
            setShowForm(false);
            setForm(BLANK_SITE);
            fetchAll();
        } catch (err) {
            showMsg(err.response?.data?.message || 'Failed to create site.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const filtered = sites.filter(s =>
        (s.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.location?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#FFFDF7]">
            <Loader2 className="animate-spin text-[#FF6D00] mb-4" size={48} />
            <p className="font-black uppercase tracking-widest text-[#1A237E]">Accessing National Archives...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FFFDF7]">
            <Navbar />

            {/* Alert Toast */}
            <AnimatePresence>
                {alert && (
                    <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
                        className={`fixed top-6 right-6 z-[999] px-6 py-4 rounded-2xl text-white text-xs font-black uppercase tracking-widest shadow-2xl flex items-center gap-3 ${alert.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                        <Zap size={16} />{alert.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="max-w-7xl mx-auto px-8 pt-44 pb-20">
                <header className="mb-16">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
                        <div>
                            <span className="text-[10px] font-black text-[#FF6D00] uppercase tracking-[0.5em] mb-4 block">National Registry</span>
                            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none text-[#1A237E]">
                                Heritage<br />Sites.
                            </h1>
                        </div>
                        {/* CREATE BUTTON FOR STAFF */}
                        {isStaff && (
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                                onClick={() => { setShowForm(true); setForm(BLANK_SITE); }}
                                className="flex items-center gap-3 bg-[#FF6D00] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-300/30">
                                <Plus size={18} /> Register New Site
                            </motion.button>
                        )}
                    </div>

                    {/* Stats bar */}
                    {sites.length > 0 && (
                        <div className="flex gap-4 mb-8 flex-wrap">
                            {Object.entries(sites.reduce((acc, s) => { acc[s.status || 'UNKNOWN'] = (acc[s.status || 'UNKNOWN'] || 0) + 1; return acc; }, {})).map(([status, count]) => (
                                <div key={status} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                                    <span className={`w-2 h-2 rounded-full ${STATUS_COLOR[status] || 'bg-slate-400'}`} />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{status}: {count}</span>
                                </div>
                            ))}
                            <div className="flex items-center gap-2 bg-[#1A237E] px-4 py-2 rounded-full">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Total: {sites.length}</span>
                            </div>
                        </div>
                    )}

                    <div className="max-w-xl relative">
                        <input type="text" placeholder="Search by name or location..."
                            className="w-full bg-white shadow-2xl rounded-full px-10 py-5 text-sm font-bold outline-none border-2 border-transparent focus:border-[#FF6D00] transition-all"
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    </div>
                </header>

                {error ? (
                    <div className="py-24 text-center bg-white rounded-[4rem] border-2 border-dashed border-rose-100">
                        <ShieldAlert size={48} className="mx-auto text-rose-300 mb-4" />
                        <p className="text-rose-400 font-black uppercase text-xs tracking-widest mb-2">Connection Error</p>
                        <p className="text-slate-400 text-sm">{error}</p>
                        <button onClick={fetchAll} className="mt-6 px-8 py-3 bg-[#FF6D00] text-white font-black uppercase text-xs tracking-widest rounded-full hover:opacity-90 transition-all">Retry</button>
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filtered.map((site, i) => (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                key={site.siteId} className="group bg-white rounded-[3rem] overflow-hidden shadow-xl border border-white hover:shadow-2xl transition-all duration-500">
                                <div className="h-64 relative overflow-hidden">
                                    <img src={getSiteImage(site)} alt={site.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop&q=80'; }} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    <span className={`absolute top-6 right-6 ${STATUS_COLOR[site.status] || 'bg-slate-400'} text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase shadow-lg`}>
                                        {site.status?.replace(/_/g, ' ')}
                                    </span>
                                    <div className="absolute bottom-6 left-6 text-white">
                                        <p className="flex items-center gap-1 text-[9px] font-black uppercase opacity-70">
                                            <MapPin size={10} className="text-[#FF6D00]" /> {site.location}
                                        </p>
                                        <h3 className="text-2xl font-black uppercase tracking-tighter mt-1">{site.name}</h3>
                                    </div>
                                </div>
                                <div className="p-8 flex justify-between items-center">
                                    <div className="flex-1 pr-4">
                                        <p className="text-xs font-medium text-slate-400 line-clamp-1">{site.description || 'Historic heritage site.'}</p>
                                        {site.preservationActivities?.length > 0 && (
                                            <p className="text-[9px] font-black text-emerald-500 mt-1">{site.preservationActivities.length} preservation records</p>
                                        )}
                                    </div>
                                    <Link to={`/tourist/sites/${site.siteId}`}
                                        className="bg-[#F8F9FF] p-3 rounded-2xl text-[#1A237E] hover:bg-[#FF6D00] hover:text-white transition-all flex-shrink-0">
                                        <Info size={18} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
                        <ShieldAlert size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-black uppercase text-xs tracking-widest">
                            {searchTerm ? `No sites matching "${searchTerm}"` : 'No heritage sites found.'}
                        </p>
                    </div>
                )}
            </main>

            {/* CREATE SITE MODAL */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowForm(false)} className="absolute inset-0 bg-[#1A237E]/60 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl z-10">
                            <button onClick={() => setShowForm(false)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-rose-100 transition-all"><X size={18} /></button>
                            <h2 className="text-2xl font-black text-[#1A237E] uppercase tracking-tighter mb-6">Register Heritage Site</h2>
                            <form onSubmit={handleCreateSite} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Site Name *</label>
                                    <input type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                        placeholder="e.g. Taj Mahal" className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-sm font-medium focus:outline-none focus:border-[#FF6D00] transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Location *</label>
                                    <input type="text" required value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                                        placeholder="e.g. Agra, UP" className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-sm font-medium focus:outline-none focus:border-[#FF6D00] transition-all" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Description</label>
                                    <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                        placeholder="Describe the heritage site..." rows={3}
                                        className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-sm font-medium focus:outline-none focus:border-[#FF6D00] transition-all" />
                                </div>
                                <button type="submit" disabled={saving}
                                    className="w-full py-4 bg-gradient-to-r from-[#1A237E] to-[#FF6D00] text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:opacity-90 transition-all disabled:opacity-60">
                                    {saving ? 'Registering...' : 'Register Site'}
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