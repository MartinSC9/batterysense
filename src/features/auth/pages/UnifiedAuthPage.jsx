import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BatteryCharging,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Zap,
  Bell,
  BarChart3,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@core/contexts/AuthContext';
import authService from '@features/auth/services/authService';
import fondoLogin from '@assets/images/fondo-login.png';

const UnifiedAuthPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setAuthUser, user } = useAuth();

  // Estados del formulario
  const [step, setStep] = useState('email'); // email | login | register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '' });

  // Redirigir si ya está autenticado, según el rol
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  // Validar fortaleza de contraseña
  useEffect(() => {
    if (step === 'register' && password) {
      let score = 0;
      if (password.length >= 8) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[a-z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^A-Za-z0-9]/.test(password)) score++;

      const texts = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Muy fuerte'];
      setPasswordStrength({ score, text: texts[score - 1] || '' });
    }
  }, [password, step]);

  // Verificar email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Ingresa tu email');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.checkEmail(email);
      if (response.exists) {
        setStep('login');
      } else {
        setStep('register');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error verificando email');
    } finally {
      setLoading(false);
    }
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) {
      toast.error('Ingresa tu contraseña');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(email, password);
      setAuthUser(response.user);
      // El useEffect de isAuthenticated se encargará de redirigir
    } catch (error) {
      toast.error(error.response?.data?.error || 'Credenciales inválidas');
      setLoading(false);
    }
  };

  // Registro
  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordStrength.score < 3) {
      toast.error('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({
        email,
        password,
        first_name: firstName || null,
        last_name: lastName || null,
        role: 'cliente',
      });
      setAuthUser(response.user);
      // El useEffect de isAuthenticated se encargará de redirigir
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error en el registro');
      setLoading(false);
    }
  };

  // Volver atrás
  const handleBack = () => {
    setStep('email');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
  };

  // Features de la plataforma
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Monitoreo en Tiempo Real',
      description: 'Visualiza voltaje, corriente y temperatura de tus baterías al instante.',
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: 'Alertas Inteligentes',
      description: 'Recibe notificaciones cuando los valores excedan los umbrales configurados.',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Históricos y Tendencias',
      description: 'Analiza el comportamiento de tus baterías con gráficos históricos.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Protección Preventiva',
      description: 'Anticípate a fallas con análisis predictivo de tus bancos de baterías.',
    },
  ];

  // Estadísticas
  const stats = [
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Monitoreo' },
    { value: '<15min', label: 'Actualización' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* Panel izquierdo - Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-900 to-blue-950 p-8 flex-col justify-center items-center relative overflow-hidden">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Contenido centrado */}
        <div className="relative z-10 max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <BatteryCharging className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">BatterySense</h1>
              <p className="text-sm text-blue-400">by TRISO</p>
            </div>
          </div>

          {/* Título */}
          <div className="mt-10">
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Monitoreo inteligente
              <br />
              <span className="text-blue-400">para tus baterías</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Plataforma de monitoreo en tiempo real para bancos de baterías.
              Optimiza el rendimiento y previene fallas antes de que ocurran.
            </p>
          </div>

          {/* Features */}
          <div className="mt-10 space-y-5">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-white font-medium">{feature.title}</h3>
                  <p className="text-gray-500 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Estadísticas */}
          <div className="mt-12 flex gap-8">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-bold text-blue-400">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Decoración */}
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-24 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Imagen de fondo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${fondoLogin})` }}
        />
        {/* Overlay oscuro con difuminado */}
        <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-sm" />

        <div className="w-full max-w-md relative z-10">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <BatteryCharging className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-xl font-bold text-white">BatterySense</h1>
          </div>

          <AnimatePresence mode="wait">
            {/* Step: Email */}
            {step === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Bienvenido</h2>
                  <p className="text-gray-400">Ingresa tu email para continuar</p>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        placeholder="tu@email.com"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Continuar
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </>
                    )}
                  </button>

                  {/* Demo accounts */}
                  <div className="mt-6 pt-5 border-t border-gray-800">
                    <p className="text-xs text-gray-500 text-center mb-3">Cuentas de demostración</p>
                    <div className="space-y-2">
                      {[
                        { email: 'tecnico@triso.com', label: 'Técnico', color: 'amber' },
                        { email: 'cliente@enertec.com.ar', label: 'Cliente', color: 'emerald' },
                      ].map((demo) => (
                        <button
                          key={demo.email}
                          type="button"
                          onClick={() => { setEmail(demo.email); setPassword('Admin123!'); setStep('login'); }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-800 hover:border-gray-700 hover:bg-gray-900/50 transition-colors text-left"
                        >
                          <span className="text-xs text-gray-400 truncate">{demo.email}</span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            demo.color === 'amber' ? 'bg-amber-500/15 text-amber-400' :
                            'bg-emerald-500/15 text-emerald-400'
                          }`}>{demo.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step: Login */}
            {step === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Cambiar email
                </button>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Iniciar sesión</h2>
                  <p className="text-gray-400">
                    Continuando como <span className="text-blue-400">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg py-3 pl-10 pr-12 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        placeholder="Tu contraseña"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Iniciar sesión'
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step: Register */}
            {step === 'register' && (
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Cambiar email
                </button>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Crear cuenta</h2>
                  <p className="text-gray-400">
                    Registrando <span className="text-blue-400">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        placeholder="Juan"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Apellido
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        placeholder="Pérez"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg py-3 pl-10 pr-12 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        placeholder="Mínimo 8 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                passwordStrength.score >= level
                                  ? level <= 2
                                    ? 'bg-red-500'
                                    : level <= 3
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                  : 'bg-gray-700'
                              }`}
                            />
                          ))}
                        </div>
                        <p className={`text-xs ${
                          passwordStrength.score <= 2
                            ? 'text-red-400'
                            : passwordStrength.score <= 3
                            ? 'text-yellow-400'
                            : 'text-green-400'
                        }`}>
                          {passwordStrength.text}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirmar contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg py-3 pl-10 pr-12 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        placeholder="Repite tu contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">Las contraseñas no coinciden</p>
                    )}
                    {confirmPassword && password === confirmPassword && (
                      <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Las contraseñas coinciden
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || password !== confirmPassword || passwordStrength.score < 3}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Crear cuenta'
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <p className="text-center text-gray-500 text-sm mt-8">
            © {new Date().getFullYear()} BatterySense by TRISO. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedAuthPage;
