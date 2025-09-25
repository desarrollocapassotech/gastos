import { useEffect, useState, type SVGProps, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import FullScreenLoader from '@/components/FullScreenLoader';

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

  useEffect(() => {
    if (!profileChecked) return;
    if (user && profile) navigate('/');
    if (user && !profile) navigate('/register');
  }, [user, profile, navigate, profileChecked]);

  const handleGoogle = async () => {
    await signInWithGoogle();
  };

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmail(email, password);
    } catch (err) {
      console.error(err);
      setError('No pudimos iniciar sesión con esas credenciales.');
    }
  };

  if (loading || (user && !profileChecked)) {
    return <FullScreenLoader />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <Button onClick={handleGoogle} className="w-full" variant="outline">
          <GoogleIcon className="mr-2 h-4 w-4" /> Ingresar con Google
        </Button>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex-1 border-t" />
          <span>o</span>
          <div className="flex-1 border-t" />
        </div>
        <form className="space-y-3" onSubmit={handleEmailLogin}>
          <Input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">
            Ingresar con email y contraseña
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;

