import { useEffect, useState, type SVGProps, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import FullScreenLoader from '@/components/FullScreenLoader';
import { Lock, LogIn, Mail, PiggyBank, Loader2 } from 'lucide-react';

const GoogleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path
      d="M24 12.276c0-.86-.077-1.711-.223-2.542H12v4.82h6.92a5.92 5.92 0 0 1-2.566 3.882v3.22h4.15c2.43-2.236 3.824-5.532 3.824-9.38z"
      fill="#4285F4"
    />
    <path
      d="M12 24c3.24 0 5.958-1.077 7.944-2.906l-4.15-3.22c-1.156.78-2.637 1.236-3.794 1.236-2.924 0-5.4-1.977-6.284-4.642H1.29v2.914A11.998 11.998 0 0 0 12 24z"
      fill="#34A853"
    />
    <path
      d="M5.716 14.468a7.2 7.2 0 0 1-.375-2.268c0-.79.137-1.558.375-2.268V6.999H1.29A11.998 11.998 0 0 0 0 12.2c0 1.89.454 3.686 1.29 5.201l4.426-3.033z"
      fill="#FBBC05"
    />
    <path
      d="M12 4.75c1.76 0 3.336.607 4.583 1.799l3.436-3.436C17.951 1.39 15.23 0 12 0 7.313 0 3.259 2.73 1.29 6.999l4.426 3.034C6.6 7.646 9.076 4.75 12 4.75z"
      fill="#EA4335"
    />
  </svg>
);

const Login = () => {
  const { signInWithGoogle, signInWithEmail, user, profile, loading, profileChecked } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  useEffect(() => {
    if (!profileChecked) return;
    if (user && profile) navigate('/');
    if (user && !profile) navigate('/register');
  }, [user, profile, navigate, profileChecked]);

  const handleGoogle = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
      setError('No pudimos iniciar sesión con Google.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsEmailLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (err) {
      console.error(err);
      setError('No pudimos iniciar sesión con esas credenciales.');
    } finally {
      setIsEmailLoading(false);
    }
  };

  if (loading || (user && !profileChecked)) {
    return <FullScreenLoader />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-200/50 blur-3xl" />

      <div className="relative w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
            <PiggyBank className="h-7 w-7" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
              Mis gastos
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">Bienvenido de nuevo</h1>
            <p className="mt-1 text-sm text-slate-500">
              Iniciá sesión para ver tu panel financiero.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur sm:p-8">
          <Button
            onClick={handleGoogle}
            className="w-full"
            variant="outline"
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon className="mr-2 h-4 w-4" />
            )}
            Ingresar con Google
          </Button>

          <div className="my-5 flex items-center gap-3 text-xs font-medium text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            <span>o con tu email</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form className="space-y-3" onSubmit={handleEmailLogin}>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10"
              />
            </div>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isEmailLoading}>
              {isEmailLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Ingresar con email y contraseña
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            ¿No tenés cuenta?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500">
              Registrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
