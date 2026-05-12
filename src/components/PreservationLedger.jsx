import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, Plus, CheckCircle2, Clock, 
    XCircle, AlertTriangle, ShieldCheck, HardHat 
} from 'lucide-react';
import { preservationService } from '../services/heritageService';

const PreservationLedger = ({ siteId, activities, onUpdate, siteStatus }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Identify clearance level from token/storage
    const userRole = localStorage.getItem('role');
    const isStaff = userRole === 'ADMIN' || userRole === 'OFFICER';

    const [form, setForm] = useState({
        description: '',
        status: 'IN_PROGRESS',
        requiresSiteClosure: false,
        date: new Date().toISOString()
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Maps to @PostMapping("/site/{siteId}")
            await preservationService.logActivity(siteId, form);
            setIsAdding(false);
            setForm({ description: '', status: 'IN_PROGRESS', requiresSiteClosure: false, date: new Date().toISOString() });
            onUpdate(); // Refreshes parent to show updated Site Status and Ledger
        } catch (err) {
            alert(err.response?.data?.message || "Protocol Deployment Failure");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (activityId, newStatus) => {
        try {
            // Maps to @PatchMapping("/{activityId}/status")
            await preservationService.updateStatus(activityId, newStatus);
            onUpdate();
        } catch (err) {
            alert("Update Rejected: " + err.response?.data?.message);
        }
    };

    const handleCancelActivity = async (activityId) => {
        if (!window.confirm("Authorize protocol cancellation?")) return;
        try {
            // Maps to @DeleteMapping("/{activityId}") which performs a soft-delete
            await preservationService.deleteActivity(activityId);
            onUpdate();
        } catch (err) {
            alert("Cancellation Failed: " + err.response?.data?.message);
        }
    };

    return (
        <section className="mt-12 bg-white rounded-[3.5rem] p-8 md:p-12 shadow-2xl border border-white relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-[#FF6D00]/10 rounded-2xl">
                        <Activity className="text-[#FF6D00]" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-[#1A237E]">Preservation Ledger</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Departmental Maintenance Logs</p>
                    </div>
                </div>

                {/* Hard Logic: Hide if site is permanently closed */}
                {isStaff && siteStatus !== 'PERMANENTLY_CLOSED' && (
                    <button 
                        onClick={() => setIsAdding(!isAdding)}
                        className="bg-[#1A237E] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FF6D00] transition-all flex items-center gap-2 shadow-xl"
                    >
                        {isAdding ? <XCircle size={14}/> : <Plus size={14}/>} {isAdding ? 'Cancel' : 'Deploy Protocol'}
                    </button>
                )}
            </div>

            {/* OFFICER LOGGING FORM */}
            <AnimatePresence>
                {isAdding && (
                    <motion.form 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        onSubmit={handleSubmit}
                        className="mb-12 bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 overflow-hidden"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[9px] font-black uppercase text-slate-400 mb-2 ml-4">Technical Description</label>
                                <textarea 
                                    required
                                    className="w-full px-6 py-4 rounded-2xl bg-white border-none text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#FF6D00] min-h-[100px]"
                                    placeholder="Detail the preservation work..."
                                    value={form.description}
                                    onChange={e => setForm({...form, description: e.target.value})}
                                />
                            </div>
                            <div className="flex flex-col gap-4 justify-center">
                                <div className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                    <input 
                                        type="checkbox" 
                                        className="w-5 h-5 rounded border-slate-300 text-[#FF6D00] focus:ring-[#FF6D00]"
                                        checked={form.requiresSiteClosure}
                                        onChange={e => setForm({...form, requiresSiteClosure: e.target.checked})}
                                    />
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-rose-500">Require Site Closure</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase">Updates site status automatically</p>
                                    </div>
                                </div>
                                <button 
                                    disabled={loading}
                                    className="w-full bg-[#FF6D00] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-200"
                                >
                                    {loading ? 'Transmitting Data...' : 'Authorize Activity Log'}
                                </button>
                            </div>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* ACTIVITY TIMELINE */}
            <div className="space-y-6">
                {activities?.length > 0 ? [...activities].reverse().map((act) => (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={act.activityId} 
                        className={`flex gap-6 group ${act.status === 'CANCELLED' ? 'opacity-40 grayscale' : ''}`}
                    >
                        <div className="flex flex-col items-center">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all ${
                                act.status === 'COMPLETED' ? 'bg-emerald-500' : 
                                act.status === 'CANCELLED' ? 'bg-slate-400' : 'bg-[#1A237E]'
                            }`}>
                                {act.status === 'COMPLETED' ? <ShieldCheck size={20}/> : <HardHat size={20}/>}
                            </div>
                            <div className="w-0.5 h-full bg-slate-100 group-last:hidden mt-2" />
                        </div>

                        <div className="flex-1 bg-slate-50/50 rounded-[2.5rem] p-6 border border-transparent hover:border-slate-200 hover:bg-white hover:shadow-xl transition-all">
                            <div className="flex justify-between items-start mb-3 text-left">
                                <div>
                                    <h4 className="font-black text-sm uppercase tracking-tight text-[#1A237E]">{act.description}</h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 text-left">Authorized by Officer ID #{act.officerId}</p>
                                </div>
                                <span className="text-[9px] font-black text-slate-300 uppercase">{new Date(act.date).toLocaleString()}</span>
                            </div>

                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                                <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${
                                    act.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 
                                    act.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                                }`}>
                                    Protocol Status: {act.status.replace('_', ' ')}
                                </span>

                                {isStaff && act.status === 'IN_PROGRESS' && (
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleStatusUpdate(act.activityId, 'COMPLETED')}
                                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                            title="Mark Completed"
                                        >
                                            <CheckCircle2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleCancelActivity(act.activityId)}
                                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Cancel Protocol"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                        <Clock size={40} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-black text-xs uppercase tracking-widest text-center">No preservation intelligence logged for this node.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default PreservationLedger;