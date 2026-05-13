import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, User, Calendar, Phone, Mail, MapPin, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

const InputField = ({ label, icon, type = 'text', name, value, onChange, placeholder, error, children, required = true }) => (
  <div className="mb-1">
    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#1A237E] mb-1.5 ml-1">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
      <input
        type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required}
        className={`w-full ${icon ? 'pl-11' : 'pl-5'} pr-5 py-3.5 text-sm bg-[#F8F9FF] border-2 rounded-2xl outline-none transition-all font-medium text-[#1A237E] placeholder-slate-300
          ${error ? 'border-rose-400 bg-rose-50' : 'border-transparent focus:border-[#FF6D00] focus:bg-white'}`}
      />
      {children}
    </div>
    {error && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{error}</p>}
  </div>
);

const SelectField = ({ label, icon, name, value, onChange, options, error }) => (
  <div className="mb-1">
    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#1A237E] mb-1.5 ml-1">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
      <select name={name} value={value} onChange={onChange} required
        className={`w-full ${icon ? 'pl-11' : 'pl-5'} pr-5 py-3.5 text-sm bg-[#F8F9FF] border-2 rounded-2xl outline-none transition-all font-medium text-[#1A237E] appearance-none cursor-pointer
          ${error ? 'border-rose-400 bg-rose-50' : 'border-transparent focus:border-[#FF6D00] focus:bg-white'}`}>
        <option value="">Select {label}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
    {error && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{error}</p>}
  </div>
);

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: '', dob: '', gender: '', contactInfo: '', email: '', address: '', password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(form.name.trim())) errs.name = 'Name must contain only letters and spaces';
    if (!form.dob) errs.dob = 'Date of birth is required';
    if (!form.gender) errs.gender = 'Gender is required';
    if (!form.contactInfo) errs.contactInfo = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(form.contactInfo)) errs.contactInfo = 'Enter valid 10-digit Indian mobile number (starts with 6-9)';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.address || form.address.trim().length < 5) errs.address = 'Address must be at least 5 characters';
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    try {
      // TouristService expects dob as LocalDate (YYYY-MM-DD string is fine)
      await api.post('/tourismgov/v1/tourist/create', {
        name: form.name.trim(),
        dob: form.dob,           // "YYYY-MM-DD" — LocalDate deserialized correctly
        gender: form.gender,
        contactInfo: form.contactInfo,
        email: form.email.toLowerCase().trim(),
        address: form.address.trim(),
        password: form.password
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || '';
      if (typeof msg === 'string' && msg.length > 0) {
        setApiError(msg);
      } else if (err.response?.status === 409) {
        setApiError('An account with this email already exists. Please login.');
      } else if (err.response?.status === 400) {
        setApiError('Validation error. Please check all fields carefully.');
      } else {
        setApiError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] via-[#FFFDF7] to-[#fff8f0] font-sans flex items-center justify-center p-4 py-10 relative overflow-hidden">
      {/* Background blobs */}
      <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ repeat: Infinity, duration: 8 }}
        className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#FF6D00]/10 rounded-full blur-3xl pointer-events-none" />
      <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ repeat: Infinity, duration: 10, delay: 2 }}
        className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#1A237E]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(26,35,126,0.18)] overflow-hidden flex flex-col lg:flex-row border border-white/60">

          {/* Left Visual Panel */}
          <div className="hidden lg:flex lg:w-5/12 relative min-h-[500px] bg-[#1A237E] p-10 flex-col justify-end overflow-hidden">
            <motion.img
              initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 8, ease: 'easeOut' }}
              src="https://images.unsplash.com/photo-1515091943-9d5c0ad74bfa?auto=format&fit=crop&q=80&w=800"
              alt="Heritage India" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A237E] via-transparent to-transparent" />
            <motion.div animate={{ x: [0, 20, 0], y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 9, ease: 'easeInOut' }}
              className="absolute top-0 right-0 w-64 h-64 bg-[#FF6D00] rounded-full blur-[100px] opacity-50" />
            <div className="relative z-10 text-white">
              <Link to="/" className="inline-flex items-center gap-2 mb-6">
                <span className="w-3 h-3 rounded-full bg-[#FF6D00]" />
                <span className="font-black tracking-tighter text-lg uppercase">TourismGov</span>
              </Link>
              <h3 className="text-4xl font-black uppercase tracking-tighter leading-tight mb-3">
                Begin Your<br /><span className="text-[#FF6D00]">Journey.</span>
              </h3>
              <p className="text-white/70 text-sm font-medium leading-relaxed">
                Register to explore India's heritage sites, book verified events, and access government tourism services.
              </p>
              <div className="mt-8 space-y-3">
                {['Official Government Portal', 'Verified Heritage Sites', 'Secure & Encrypted'].map((f, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.15 }}
                    className="flex items-center gap-3 text-white/80 text-xs font-bold">
                    <CheckCircle size={14} className="text-[#FF6D00]" />{f}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="w-full lg:w-7/12 p-6 lg:p-10 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: 2, duration: 0.5 }}
                    className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-emerald-600" />
                  </motion.div>
                  <h3 className="text-2xl font-black text-[#1A237E] uppercase tracking-tight mb-2">Registration Successful!</h3>
                  <p className="text-slate-400 text-sm font-medium">Redirecting you to login...</p>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="mb-6">
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-[#1A237E]">Create Account</h2>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Tourist Registration Portal</p>
                  </div>

                  {apiError && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold px-4 py-3 rounded-2xl mb-5">
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                      <span>{apiError}</span>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField label="Full Name" icon={<User size={15} />} name="name" value={form.name} onChange={handleChange}
                      placeholder="Ramesh Kumar" error={errors.name} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Date of Birth" icon={<Calendar size={15} />} type="date" name="dob" value={form.dob}
                        onChange={handleChange} error={errors.dob} />
                      <SelectField label="Gender" name="gender" value={form.gender} onChange={handleChange} error={errors.gender}
                        options={[{ value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }, { value: 'OTHER', label: 'Other' }]} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Mobile Number" icon={<Phone size={15} />} type="tel" name="contactInfo" value={form.contactInfo}
                        onChange={handleChange} placeholder="9876543210" error={errors.contactInfo} />
                      <InputField label="Email Address" icon={<Mail size={15} />} type="email" name="email" value={form.email}
                        onChange={handleChange} placeholder="name@example.com" error={errors.email} />
                    </div>

                    <InputField label="Full Address" icon={<MapPin size={15} />} name="address" value={form.address}
                      onChange={handleChange} placeholder="123 MG Road, Mumbai, Maharashtra 400001" error={errors.address} />

                    <InputField label="Password (min 8 chars)" icon={<Lock size={15} />} type={showPassword ? 'text' : 'password'}
                      name="password" value={form.password} onChange={handleChange} placeholder="••••••••" error={errors.password}>
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#FF6D00] transition-colors">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </InputField>

                    <motion.button type="submit" disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-[#1A237E] to-[#2c3aad] text-white font-black uppercase tracking-[0.2em] text-sm rounded-2xl shadow-xl shadow-indigo-200/50 hover:from-[#FF6D00] hover:to-[#ff8c35] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-60 mt-2">
                      {loading ? <><Loader2 size={18} className="animate-spin" />Creating Account...</> : 'Create Account'}
                    </motion.button>
                  </form>

                  <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Already have an account?
                      <Link to="/login" className="ml-2 text-[#FF6D00] hover:text-[#1A237E] transition-colors hover:underline">Sign In</Link>
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