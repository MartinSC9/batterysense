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
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@core/contexts/AuthContext';
import authService from '@features/auth/services/authService';
import fondoLogin from '@assets/images/fondo-login.png';

const UnifiedAuthPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, setAuthUser, user } = useAuth();

  const [step, setStep] = useState('email'); // email | login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

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
        toast.error('Email no registrado. Contacta al administrador.');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error verificando email');
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error) {
      toast.error(error.response?.data?.error || 'Credenciales inválidas');
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('email');
    setPassword('');
    setShowPassword(false);
  };

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Monitoreo en Tiempo Real',
      description: 'Visualiza voltaje, corriente y estado de tus baterías al instante.',
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

  const stats = [
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Monitoreo' },
    { value: '<15min', label: 'Actualización' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* Panel izquierdo - Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-900 to-blue-950 p-8 flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <BatteryCharging className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">BatterySense</h1>
              <p className="text-xs text-blue-400">by TRISO</p>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-3xl font-bold text-white leading-tight mb-3">
              Monitoreo inteligente
              <br />
              <span className="text-blue-400">para tus baterías</span>
            </h2>
            <p className="text-gray-400 text-base">
              Plataforma de monitoreo en tiempo real para bancos de baterías.
              Optimiza el rendimiento y previene fallas antes de que ocurran.
            </p>
          </div>

          <div className="mt-6 space-y-3.5">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm">{feature.title}</h3>
                  <p className="text-gray-500 text-xs">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex gap-8">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-2xl font-bold text-blue-400">{stat.value}</div>
                <div className="text-gray-500 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-24 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${fondoLogin})` }}
        />
        <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-sm" />

        <div className="w-full max-w-md relative z-10">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <BatteryCharging className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-xl font-bold text-white">BatterySense</h1>
          </div>

          <AnimatePresence mode="wait">
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

                  <div className="mt-6 pt-5 border-t border-gray-800">
                    <p className="text-xs text-gray-500 text-center mb-3">Cuenta demo</p>
                    <button
                      type="button"
                      onClick={() => { setEmail('rjuarez@telecom-cba.com.ar'); setPassword('Admin123!'); setStep('login'); }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-800 hover:border-gray-700 hover:bg-gray-900/50 transition-colors text-left"
                    >
                      <span className="text-xs text-gray-400">rjuarez@telecom-cba.com.ar</span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">Demo</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

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
          </AnimatePresence>

          <p className="text-center text-gray-500 text-sm mt-8">
            © {new Date().getFullYear()} BatterySense by TRISO. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedAuthPage;
