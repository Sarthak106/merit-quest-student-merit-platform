import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Phone, Building2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import BlurText from '../components/ui/BlurText';
import GradientText from '../components/ui/GradientText';
import Particles from '../components/ui/Particles';

const ROLES = [
  { value: 'STUDENT',       label: 'Student' },
  { value: 'PARENT',        label: 'Parent' },
  { value: 'SCHOOL_ADMIN',  label: 'School Administrator' },
  { value: 'DATA_VERIFIER', label: 'Data Verifier' },
  { value: 'NGO_REP',       label: 'NGO Representative' },
  { value: 'GOV_AUTHORITY', label: 'Government Authority' },
];

export default function Register() {
  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '',
    role: 'STUDENT', institutionId: '', phone: '',
  });
  const [error, setError] = useState('');
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      ...form,
      institutionId: form.institutionId ? Number(form.institutionId) : null,
      phone: form.phone || null,
    };

    const result = await register(payload);
    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4 py-8 relative overflow-hidden">
      <Particles count={25} />

      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white mb-4 shadow-glow"
          >
            <span className="text-2xl font-bold">MQ</span>
          </motion.div>
          <BlurText text="Create account" className="text-3xl font-bold text-white block" delay={100} />
          <p className="text-white/50 mt-2">Join{' '}
            <GradientText colors={['#818cf8', '#6366f1', '#a78bfa', '#818cf8']} animationSpeed={5}>
              Merit Quest
            </GradientText>{' '}today
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">First name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input type="text" value={form.firstName} onChange={update('firstName')}
                    className="input-field pl-10" placeholder="First" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Last name</label>
                <input type="text" value={form.lastName} onChange={update('lastName')}
                  className="input-field" placeholder="Last" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input type="email" value={form.email} onChange={update('email')}
                  className="input-field pl-10" placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input type="password" value={form.password} onChange={update('password')}
                  className="input-field pl-10" placeholder="Min 8 characters" required minLength={8} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Role</label>
              <select value={form.role} onChange={update('role')} className="input-field">
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Institution ID (optional)</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input type="number" value={form.institutionId} onChange={update('institutionId')}
                  className="input-field pl-10" placeholder="e.g. 1" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input type="tel" value={form.phone} onChange={update('phone')}
                  className="input-field pl-10" placeholder="+91 9876543210" />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
