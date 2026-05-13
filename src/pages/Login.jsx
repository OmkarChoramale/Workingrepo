import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setErrorMsg('Please enter both email and password.'); return; }
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await axios.post('http://localhost:8383/tourismgov/v1/auth/login', {
        email: form.email.toLowerCase().trim(),
        password: form.password
      });
      const { token, role, userId, name } = response.data;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('userId', String(userId));
        localStorage.setItem('name', name);
        setSuccess(true);
        setTimeout(() => { navigate('/dashboard'); window.location.reload(); }, 1200);
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.response?.data || '';
      if (status === 401) setErrorMsg('Invalid email or password. Please try again.');
      else if (status === 403) setErrorMsg('Account is disabled or not activated.');
      else if (status === 404) setErrorMsg('No account found with this email. Please register first.');
      else if (typeof msg === 'string' && msg.length > 0) setErrorMsg(msg);
      else if (!err.response) setErrorMsg('Cannot connect to server. Make sure the backend is running.');
      else setErrorMsg('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] via-[#FFFDF7] to-[#fff8f0] font-sans flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ repeat: Infinity, duration: 8 }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#FF6D00]/10 rounded-full blur-3xl pointer-events-none" />
      <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ repeat: Infinity, duration: 10, delay: 3 }}
        className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#1A237E]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(26,35,126,0.18)] overflow-hidden flex flex-col lg:flex-row-reverse border border-white/60 min-h-[520px]">

          {/* Right Visual Panel */}
          <div className="hidden lg:flex lg:w-1/2 relative bg-[#1A237E] p-12 flex-col justify-end overflow-hidden">
            <motion.img initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 8, ease: 'easeOut' }}
              src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=800"
              alt="Taj Mahal" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A237E] via-transparent to-transparent" />
            <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
              className="absolute top-0 left-0 w-64 h-64 bg-[#FF6D00] rounded-full blur-[100px] opacity-50 -translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10 text-white">
              <Link to="/" className="inline-flex items-center gap-2 mb-8">
                <span className="w-3 h-3 rounded-full bg-[#FF6D00]" />
                <span className="font-black tracking-tighter text-lg uppercase">TourismGov</span>
              </Link>
              <h3 className="text-5xl font-black uppercase tracking-tighter leading-tight mb-4">
                Welcome<br /><span className="text-[#FF6D00]">Back.</span>
              </h3>
              <p className="text-white/70 font-medium leading-relaxed max-w-sm text-sm">
                Access your dashboard, track heritage site bookings, and explore Incredible India.
              </p>
            </div>
          </div>

          {/* Left Form Panel */}
          <div className="w-full lg:w-1/2 p-8 lg:p-14 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: 2, duration: 0.5 }}
                    className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-emerald-600" />
                  </motion.div>
                  <h3 className="text-2xl font-black text-[#1A237E] uppercase tracking-tight">Login Successful!</h3>
                  <p className="text-slate-400 text-sm font-medium mt-2">Redirecting to dashboard...</p>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="mb-8">
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-[#1A237E]">Sign In</h2>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Access your government portal</p>
                  </div>

                  <AnimatePresence>
                    {errorMsg && (
                      <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold px-4 py-3 rounded-2xl mb-6">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                        <span>{errorMsg}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#1A237E] mb-1.5 ml-1">Email Address</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="name@example.com" required
                          className="w-full pl-11 pr-5 py-4 text-sm bg-[#F8F9FF] border-2 border-transparent rounded-2xl focus:border-[#FF6D00] focus:bg-white outline-none transition-all font-medium text-[#1A237E] placeholder-slate-300" />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#1A237E] mb-1.5 ml-1">Password</label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required
                          className="w-full pl-11 pr-12 py-4 text-sm bg-[#F8F9FF] border-2 border-transparent rounded-2xl focus:border-[#FF6D00] focus:bg-white outline-none transition-all font-medium text-[#1A237E] placeholder-slate-300" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#FF6D00] transition-colors">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <motion.button type="submit" disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-[#1A237E] to-[#2c3aad] text-white font-black uppercase tracking-[0.2em] text-sm rounded-2xl shadow-xl shadow-indigo-200/50 hover:from-[#FF6D00] hover:to-[#ff8c35] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-60 mt-2">
                      {loading ? <><Loader2 size={18} className="animate-spin" />Verifying...</> : 'Secure Login'}
                    </motion.button>
                  </form>

                  <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      New to the portal?
                      <Link to="/register" className="ml-2 text-[#FF6D00] hover:text-[#1A237E] transition-colors hover:underline">Register Account</Link>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}