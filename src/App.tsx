/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  FileText, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight, 
  AlertTriangle,
  Clock,
  MapPin,
  GraduationCap,
  BookOpen,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { supabase } from './supabase';

// --- Types ---
type Role = 'ADMIN' | 'GURU' | 'TENAGA_KEPENDIDIKAN' | 'SISWA';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  role: Role;
  major?: string;
  nisn?: string;
}

// --- Context ---
const AuthContext = createContext<{
  user: UserProfile | null;
  loading: boolean;
  signIn: (data: any) => Promise<void>;
  signOut: () => Promise<void>;
} | null>(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// --- Auth Provider ---
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      try {
        const url = (supabase as any).supabaseUrl || '';
        const isPlaceholder = url.includes('placeholder.supabase.co');
        if (isPlaceholder || !url) {
          console.warn('Using mock session due to missing credentials');
          setLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            setUser(profile);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const currentUrl = (supabase as any).supabaseUrl || '';
    const isPlaceholder = currentUrl.includes('placeholder.supabase.co');
    if (!isPlaceholder && currentUrl) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setUser(profile);
        } else {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const signIn = async ({ username, password, major }: any) => {
    // Mock login if no Supabase credentials or using placeholder
    const url = (supabase as any).supabaseUrl || '';
    const isPlaceholder = url.includes('placeholder.supabase.co');
    if (isPlaceholder || !url) {
      setLoading(true);
      setTimeout(() => {
        setUser({
          id: 'mock-id',
          username: username,
          full_name: username.toUpperCase(),
          role: username.toLowerCase().includes('guru') || username.toLowerCase().includes('admin') ? 'ADMIN' : 'SISWA',
          major: major || 'TKJ'
        });
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      const email = username.includes('@') ? username : `${username}@smk-pu.com`;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      alert('Login gagal: ' + error.message);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// --- Components ---

const LandingPage = () => {
  const navigate = useNavigate();
  
  const majors = [
    { title: 'Teknik Komputer & Jaringan', code: 'TKJ', icon: <LayoutDashboard className="w-8 h-8" /> },
    { title: 'Desain Komunikasi Visual', code: 'DKV', icon: <BookOpen className="w-8 h-8" /> },
    { title: 'Akuntansi', code: 'AK', icon: <Briefcase className="w-8 h-8" /> },
    { title: 'Broadcasting', code: 'BC', icon: <FileText className="w-8 h-8" /> },
    { title: 'Manajemen Perkantoran', code: 'MPLB', icon: <Users className="w-8 h-8" /> },
    { title: 'Bisnis Digital', code: 'BD', icon: <UserCheck className="w-8 h-8" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-600 to-red-800 text-white p-6">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10"
        >
          <img src="https://api.dicebear.com/7.x/initials/svg?seed=PU&backgroundColor=ffffff&textColor=dc2626" alt="Logo" className="w-24 h-24 mx-auto rounded-2xl shadow-2xl mb-8 border-4 border-white/20" />
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 drop-shadow-lg">SMK PRIMA UNGGUL</h1>
          <p className="text-xl md:text-2xl font-light opacity-90 max-w-2xl mx-auto mb-10 leading-relaxed">
            Membangun generasi unggul yang kreatif, inovatif, dan berakhlak mulia di Kota Tangerang Selatan.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => navigate('/login')}
              className="bg-white text-red-600 px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:scale-105 transition-transform active:scale-95 flex items-center gap-2"
            >
              Masuk Aplikasi <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* 3D Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -left-20 w-96 h-96 border-8 border-white/50 rounded-full"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-20 -right-20 w-80 h-80 border-4 border-white/30 rounded-3xl"
          />
        </div>
      </section>

      {/* Majors Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16 text-slate-800">Program Keahlian Kami</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {majors.map((major, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -10, rotateX: 5, rotateY: 5 }}
              className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 real-shadow transition-all group perspective-1000"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300 transform-gpu preserve-3d">
                {major.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-800">{major.title}</h3>
              <p className="text-slate-500 font-medium">Lulusan {major.code} yang siap kerja dan berwirausaha dengan kompetensi industri terkini.</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-6 text-center">
        <p className="opacity-60">© {new Date().getFullYear()} SMK Prima Unggul Tangerang Selatan. All rights reserved.</p>
      </footer>
    </div>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loginMode, setLoginMode] = useState<'SISWA' | 'STAFF'>('SISWA');
  const [formData, setFormData] = useState({ username: '', password: '', major: 'TKJ' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(formData);
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* 3D background effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-red-500/5 z-0 pointer-events-none skew-y-12 transform-gpu"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 perspective-1000"
      >
        <div className="bg-red-600 p-10 text-white text-center">
          <GraduationCap className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold tracking-tight">Login Portal</h2>
          <p className="opacity-80 mt-2">Selamat datang di Sistem Akademik</p>
        </div>

        <div className="p-8">
          <div className="flex gap-2 mb-8 p-1 bg-slate-100 rounded-xl">
            <button 
              onClick={() => setLoginMode('SISWA')}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${loginMode === 'SISWA' ? 'bg-white shadow text-red-600' : 'text-slate-500'}`}
            >
              Siswa
            </button>
            <button 
              onClick={() => setLoginMode('STAFF')}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${loginMode === 'STAFF' ? 'bg-white shadow text-red-600' : 'text-slate-500'}`}
            >
              Guru/Staff
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{loginMode === 'SISWA' ? 'NISN / Username' : 'Username'}</label>
              <input 
                type="text" 
                required
                className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                placeholder={loginMode === 'SISWA' ? 'Masukkan NISN anda' : 'Masukkan username'}
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>

            {loginMode === 'SISWA' && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Jurusan</label>
                <select 
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all appearance-none bg-slate-50"
                  value={formData.major}
                  onChange={(e) => setFormData({...formData, major: e.target.value})}
                >
                  <option value="TKJ">Teknik Komputer & Jaringan</option>
                  <option value="DKV">Desain Komunikasi Visual</option>
                  <option value="AK">Akuntansi</option>
                  <option value="BC">Broadcasting</option>
                  <option value="MPLB">Manajemen Perkantoran</option>
                  <option value="BD">Bisnis Digital</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-red-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-red-700 shadow-xl shadow-red-200 transition-all transform hover:-translate-y-1"
            >
              Masuk Sekarang
            </button>
          </form>

          <button 
            onClick={() => navigate('/')}
            className="w-full mt-6 text-slate-500 font-medium hover:text-red-600 transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = {
    ADMIN: [
      { path: '/app', label: 'Dashboard', icon: <LayoutDashboard /> },
      { path: '/app/absensi-karyawan', label: 'Absensi Karyawan', icon: <UserCheck /> },
      { path: '/app/absensi-siswa', label: 'Absensi Siswa', icon: <Users /> },
      { path: '/app/rekap', label: 'Rekap Absensi', icon: <FileText /> },
      { path: '/app/data-siswa', label: 'Data Siswa', icon: <GraduationCap /> },
      { path: '/app/users', label: 'User Management', icon: <Users /> },
    ],
    GURU: [
      { path: '/app', label: 'Dashboard', icon: <LayoutDashboard /> },
      { path: '/app/absensi-karyawan', label: 'Absensi Karyawan', icon: <UserCheck /> },
      { path: '/app/absensi-siswa', label: 'Absensi Siswa', icon: <Users /> },
      { path: '/app/rekap-siswa', label: 'Rekap Absensi Siswa', icon: <FileText /> },
    ],
    TENAGA_KEPENDIDIKAN: [
      { path: '/app', label: 'Dashboard', icon: <LayoutDashboard /> },
      { path: '/app/absensi-karyawan', label: 'Absensi Karyawan', icon: <UserCheck /> },
    ],
    SISWA: [
      { path: '/app', label: 'Beranda', icon: <LayoutDashboard /> },
      { path: '/app/ujian', label: 'Ujian Online', icon: <BookOpen /> },
    ]
  };

  const activeRole = user?.role || 'SISWA';
  const roleMenu = menuItems[activeRole];

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="w-72 bg-white border-r border-slate-200 flex flex-col z-50 shadow-2xl md:shadow-none fixed md:static h-full"
          >
            <div className="p-8 border-b border-slate-100 flex items-center gap-3">
              <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <h1 className="font-extrabold text-slate-800 leading-tight">SMK PRIMA</h1>
                <p className="text-xs font-bold text-red-600 tracking-widest uppercase">UNGGUL PORTAL</p>
              </div>
            </div>

            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Main Menu</p>
              {roleMenu.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl font-bold transition-all ${
                    location.pathname === item.path 
                    ? 'bg-red-600 text-white shadow-xl shadow-red-200' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-red-600'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="p-6 border-t border-slate-100">
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold uppercase">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-slate-800 truncate text-sm">{user?.full_name || 'User'}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{user?.role || 'Siswa'}</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Navbar */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              {isSidebarOpen ? <X /> : <Menu />}
            </button>
            <div className="hidden md:block">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
              <p className="text-sm font-bold text-slate-600 flex items-center gap-1"><MapPin className="w-3 h-3" /> Tangerang Selatan</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={signOut}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        {/* Scrollable View */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

// --- Features ---

// --- Features ---

const GlobalDataStore = {
  exams: [
    { id: 1, name: 'Budi Santoso', nisn: '2223001', score: 85, status: 'LULUS', date: new Date().toISOString() },
    { id: 2, name: 'Siti Aminah', nisn: '2223002', score: 45, status: 'REMEDIAL', date: new Date().toISOString() },
  ],
  attendance: [
    { id: 1, name: 'Budi Santoso', role: 'SISWA', time: '07:15', status: 'HADIR' },
    { id: 2, name: 'Pak Ahmad', role: 'GURU', time: '06:45', status: 'HADIR' },
  ]
};

const GradeMonitoring = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Hasil Ujian Siswa</h2>
        <p className="text-slate-500 font-medium italic">Pantau nilai dan hasil pengerjaan soal siswa secara real-time.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
            <tr>
              <th className="px-8 py-4">Nama Siswa</th>
              <th className="px-8 py-4">NISN</th>
              <th className="px-8 py-4">Skor</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {GlobalDataStore.exams.map(exam => (
              <tr key={exam.id} className="text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                <td className="px-8 py-5">{exam.name}</td>
                <td className="px-8 py-5 text-slate-400 font-mono">{exam.nisn}</td>
                <td className="px-8 py-5">
                  <span className="text-lg font-black text-slate-800">{exam.score}</span>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black ${exam.status === 'LULUS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {exam.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-slate-400">{format(new Date(exam.date), 'dd/MM/yyyy')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AttendanceMonitor = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Rekap Absensi Harian</h2>
        <p className="text-slate-500 font-medium">Monitoring kehadiran Siswa dan Guru di Kota Tangerang Selatan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-6 bg-red-600 text-white font-bold flex items-center justify-between">
            <span>Absensi Siswa</span>
            <Users className="w-5 h-5" />
          </div>
          <div className="p-4 space-y-3">
             {GlobalDataStore.attendance.filter(a => a.role === 'SISWA').map(a => (
               <div key={a.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                 <div>
                   <p className="font-bold text-slate-800">{a.name}</p>
                   <p className="text-xs text-slate-400">Jam Masuk: {a.time}</p>
                 </div>
                 <span className="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black">HADIR</span>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-6 bg-slate-900 text-white font-bold flex items-center justify-between">
            <span>Absensi Guru & Staff</span>
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="p-4 space-y-3">
             {GlobalDataStore.attendance.filter(a => a.role === 'GURU').map(a => (
               <div key={a.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                 <div>
                   <p className="font-bold text-slate-800">{a.name}</p>
                   <p className="text-xs text-slate-400">Jam Masuk: {a.time}</p>
                 </div>
                 <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-[10px] font-black">HADIR</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardContent = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ present: 0, late: 0, absent: 0 });

  useEffect(() => {
    // Mock data for dashboard
    setStats({ present: 85, late: 12, absent: 3 });
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Selamat Datang, {user?.full_name?.split(' ')[0]}! 👋</h2>
          <p className="text-slate-500 font-medium">Berikut ringkasan aktivitas anda hari ini di SMK Prima Unggul.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl shadow-xl border border-green-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Kehadiran</p>
            <p className="text-3xl font-black text-slate-800">{stats.present}%</p>
          </div>
        </motion.div>
        
        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl shadow-xl border border-yellow-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Keterlambatan</p>
            <p className="text-3xl font-black text-slate-800">{stats.late}%</p>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl shadow-xl border border-red-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Ketidakhadiran</p>
            <p className="text-3xl font-black text-slate-800">{stats.absent}%</p>
          </div>
        </motion.div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Aktivitas Terbaru</h3>
          <button className="text-red-600 font-bold text-sm hover:underline">Lihat Semua</button>
        </div>
        <div className="p-8">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 items-start pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                  <UserCheck className="w-6 h-6 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800">Absensi Masuk Berhasil</p>
                  <p className="text-sm text-slate-500 font-medium">Anda telah melakukan absensi masuk pada jam 07:12:45 WIB.</p>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase">2 jam yang lalu</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ExamModule = () => {
  const [activeTab, setActiveTab] = useState<'IDLE' | 'STARTED' | 'FINISHED'>('IDLE');
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showWarning, setShowWarning] = useState(false);
  const audioRef = useState<HTMLAudioElement | null>(null);

  // Anti-cheating logic
  useEffect(() => {
    const handleBlur = () => {
      if (activeTab === 'STARTED') {
        setShowWarning(true);
        // Play alarm sound (synthetic)
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1);
        
        alert('PERINGATAN! Jangan berpindah tab atau aplikasi saat ujian berlangsung. Pelanggaran dicatat oleh sistem.');
      }
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'STARTED' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setActiveTab('FINISHED');
    }
  }, [activeTab, timeLeft]);

  const questions = Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    text: `Contoh soal ujian nomor ${i + 1} untuk jurusan ini?`,
    options: ['Jawaban A', 'Jawaban B', 'Jawaban C', 'Jawaban D'],
    difficulty: i % 2 === 0 ? 'MUDAH' : 'SULIT'
  }));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (activeTab === 'IDLE') {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-2xl border border-slate-100">
          <BookOpen className="w-16 h-16 text-red-600 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-slate-800 mb-4">Ujian Tengah Semester</h2>
          <p className="text-slate-500 font-medium mb-8">
            Waktu: 60 Menit | Total: 40 Soal<br />
            KKM: 50 | Anti-Nyontek Aktif
          </p>
          <div className="bg-red-50 p-6 rounded-2xl mb-8 text-left border border-red-100">
            <h4 className="font-bold text-red-600 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Peraturan Ujian</h4>
            <ul className="text-sm text-red-900/70 space-y-2 font-medium list-disc list-inside">
              <li>Jangan berpindah tab atau menutup browser.</li>
              <li>Sistem mencatat setiap aktivitas mencurigakan.</li>
              <li>Pastikan koneksi internet stabil.</li>
              <li>Suara alarm akan berbunyi jika terdeteksi kecurangan.</li>
            </ul>
          </div>
          <button 
            onClick={() => setActiveTab('STARTED')}
            className="w-full bg-red-600 text-white py-5 rounded-2xl font-bold text-xl hover:bg-red-700 shadow-xl shadow-red-100 transition-all"
          >
            Mulai Ujian
          </button>
        </div>
      </div>
    );
  }

  if (activeTab === 'FINISHED') {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-2xl border border-slate-100">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <UserCheck className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Ujian Selesai!</h2>
          <p className="text-slate-500 font-medium mb-10">Jawaban anda telah berhasil disimpan ke server.</p>
          
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Skor Anda</p>
              <p className="text-4xl font-black text-slate-800">82.5</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Keterangan</p>
              <p className="text-xl font-black text-green-600">LULUS (KKM 50)</p>
            </div>
          </div>

          <button 
            onClick={() => window.location.href = '/app'}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 perspective-1000 relative">
          <div className="flex justify-between items-center mb-8">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest ${questions[currentQuestion].difficulty === 'SULIT' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              SOAL {currentQuestion + 1} • {questions[currentQuestion].difficulty}
            </span>
            <div className="flex items-center gap-2 text-red-600 font-bold text-xl">
              <Clock className="w-5 h-5" /> {formatTime(timeLeft)}
            </div>
          </div>

          <h3 className="text-2xl font-bold text-slate-800 mb-10 leading-relaxed">
            {questions[currentQuestion].text}
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {questions[currentQuestion].options.map((option, idx) => (
              <button 
                key={idx}
                onClick={() => setAnswers({...answers, [currentQuestion]: option})}
                className={`w-full text-left p-6 rounded-2xl font-bold border-2 transition-all flex items-center justify-between group ${
                  answers[currentQuestion] === option 
                  ? 'border-red-600 bg-red-50 text-red-600' 
                  : 'border-slate-100 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                    answers[currentQuestion] === option ? 'border-red-600 bg-red-600 text-white' : 'border-slate-200 bg-white group-hover:border-slate-400'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option}
                </div>
                {answers[currentQuestion] === option && <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-50">
            <button 
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion(prev => prev - 1)}
              className="px-8 py-4 rounded-xl font-bold bg-slate-100 text-slate-600 disabled:opacity-50 hover:bg-slate-200"
            >
              Sebelumnya
            </button>
            <button 
              onClick={() => {
                if (currentQuestion === questions.length - 1) {
                  if (confirm('Selesaikan ujian sekarang?')) setActiveTab('FINISHED');
                } else {
                  setCurrentQuestion(prev => prev + 1);
                }
              }}
              className="px-10 py-4 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200"
            >
              {currentQuestion === questions.length - 1 ? 'Selesai & Kumpul' : 'Simpan & Lanjut'}
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 sticky top-24">
          <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Navigasi Soal</h4>
          <div className="grid grid-cols-5 gap-3">
            {questions.map((q, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`aspect-square rounded-xl text-xs font-bold transition-all border-2 ${
                  currentQuestion === idx 
                  ? 'border-red-600 bg-white text-red-600 ring-4 ring-red-50' 
                  : answers[idx] 
                    ? 'bg-slate-900 border-slate-900 text-white' 
                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-50 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <div className="w-3 h-3 bg-slate-900 rounded-full"></div> Jawaban Terisi
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <div className="w-3 h-3 bg-white border-2 border-slate-200 rounded-full"></div> Belum Terisi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- App Root ---

const AttendancePage = ({ type }: { type: 'KARYAWAN' | 'SISWA' }) => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const handleClockIn = async () => {
    setLoading(true);
    setTimeout(() => {
      const newRecord = {
        id: Date.now(),
        date: new Date().toISOString(),
        time: format(new Date(), 'HH:mm:ss'),
        status: 'HADIR',
        location: 'Tangerang Selatan'
      };
      setHistory([newRecord, ...history]);
      setLoading(false);
      alert('Absensi berhasil dicatat!');
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Absensi {type}</h2>
        <p className="text-slate-500 font-medium tracking-tight">Catat kehadiran harian anda secara real-time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
          <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-12 h-12" />
          </div>
          <p className="text-4xl font-black text-slate-800 mb-2">{format(new Date(), 'HH:mm')}</p>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-8">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
          <button 
            onClick={handleClockIn}
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2 ${
              loading ? 'bg-slate-100 text-slate-400' : 'bg-red-600 text-white hover:bg-red-700 shadow-red-200 hover:-translate-y-1'
            }`}
          >
            {loading ? 'Memproses...' : <><UserCheck className="w-6 h-6" /> Absen Sekarang</>}
          </button>
        </div>

        <div className="md:col-span-2 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-white hover:border-slate-50 transition-colors">
            <h3 className="text-xl font-bold text-slate-800">Riwayat Absensi</h3>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-8 py-4">Tanggal</th>
                <th className="px-8 py-4">Waktu</th>
                <th className="px-8 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {history.map(r => (
                <tr key={r.id} className="text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5">{format(new Date(r.date), 'dd/MM/yyyy')}</td>
                  <td className="px-8 py-5">{r.time}</td>
                  <td className="px-8 py-5"><span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] uppercase font-black">{r.status}</span></td>
                </tr>
              ))}
              {history.length === 0 && <tr><td colSpan={3} className="px-8 py-12 text-center text-slate-400">Belum ada data.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const users = [
    { id: '1', full_name: 'Admin SMK', username: 'admin', role: 'ADMIN', major: '-' },
    { id: '2', full_name: 'Guru TKJ', username: 'guru_tkj', role: 'GURU', major: 'TKJ' },
    { id: '3', full_name: 'Siswa Satu', username: '2223001', role: 'SISWA', major: 'TKJ' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Manajemen Pengguna</h2>
        <button className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 shadow-xl shadow-red-100 transition-all">
          <Users className="w-5 h-5" /> Tambah User
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
            <tr>
              <th className="px-8 py-4">Nama</th>
              <th className="px-8 py-4">Username</th>
              <th className="px-8 py-4">Role</th>
              <th className="px-8 py-4">Jurusan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map(u => (
              <tr key={u.id} className="text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                <td className="px-8 py-5">{u.full_name}</td>
                <td className="px-8 py-5 text-slate-400 font-mono tracking-tighter">{u.username}</td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${u.role === 'ADMIN' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{u.role}</span>
                </td>
                <td className="px-8 py-5">{u.major}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<DashboardContent />} />
    <Route path="/ujian" element={<ExamModule />} />
    <Route path="/absensi-karyawan" element={<AttendancePage type="KARYAWAN" />} />
    <Route path="/absensi-siswa" element={<AttendancePage type="SISWA" />} />
    <Route path="/rekap-siswa" element={<GradeMonitoring />} />
    <Route path="/rekap" element={<AttendanceMonitor />} />
    <Route path="/users" element={<UserManagement />} />
    <Route path="/data-siswa" element={<UserManagement />} />
    <Route path="*" element={<Navigate to="/app" />} />
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/app/*" element={
            <ProtectedRoute>
              <DashboardLayout>
                <AppRoutes />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-16 h-16 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
    </div>
  );
  
  // For demo purposes, we allow entry even if user is null to see UI
  // In production: if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
}
