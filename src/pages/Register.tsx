import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { db } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2, Lock, Mail, Phone, PiggyBank } from 'lucide-react';

const getSignUpErrorMessage = (error: unknown) => {
  const code = (error as { code?: string })?.code;
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con ese email. Iniciá sesión en su lugar.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/invalid-email':
      return 'El email ingresado no es válido.';
    default:
      return 'No pudimos crear la cuenta. Intentalo nuevamente.';
  }
};

const Register = () => {
  const { user, profile, profileChecked, refreshProfile, signOutUser, signUpWithEmail } =
    useAuth();
  const navigate = useNavigate();

  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) navigate('/');
  }, [profile, navigate]);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setSignUpError(null);
    setIsSigningUp(true);
    try {
      await signUpWithEmail(signUpEmail, signUpPassword);
    } catch (err) {
      console.error(err);
      setSignUpError(getSignUpErrorMessage(err));
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        phone,
        email,
      });
      await refreshProfile();
      navigate('/');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = async () => {
    if (user) await signOutUser();
    navigate('/login');
  };

  const showProfileForm = user && profileChecked && !profile;

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
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              {showProfileForm ? 'Completá tu perfil' : 'Creá tu cuenta'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {showProfileForm
                ? 'Necesitamos algunos datos para armar tu panel financiero.'
                : 'Registrate con tu email para empezar a organizar tus gastos.'}
            </p>
          </div>
        </div>

        {showProfileForm ? (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur sm:p-8"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Completar registro
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={handleBackToLogin}>
              Volver al login
            </Button>
          </form>
        ) : (
          <form
            onSubmit={handleSignUp}
            className="space-y-4 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur sm:p-8"
          >
            <div className="space-y-2">
              <Label htmlFor="signUpEmail">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="signUpEmail"
                  type="email"
                  placeholder="Correo electrónico"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signUpPassword">Contraseña</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="signUpPassword"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>
            {signUpError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-destructive">
                {signUpError}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isSigningUp}>
              {isSigningUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear cuenta
            </Button>

            <p className="text-center text-sm text-slate-500">
              ¿Ya tenés cuenta?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
                Iniciá sesión
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
