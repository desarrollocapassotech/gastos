import { useEffect, useRef, useState, type SVGProps } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { Phone } from 'lucide-react';

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
  const { signInWithGoogle, signInWithPhone, user, profile } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const verifier = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (user && profile) navigate('/');
    if (user && !profile) navigate('/register');
  }, [user, profile, navigate]);

  const handleGoogle = async () => {
    await signInWithGoogle();
  };

  const handleSendCode = async () => {
    if (!verifier.current) {
      verifier.current = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
        }
      );
    }
    const formatted = phone.startsWith('+') ? phone : `+${phone}`;
    const result = await signInWithPhone(formatted, verifier.current);
    setConfirmation(result);
  };

  const handleVerifyCode = async () => {
    if (!confirmation) return;
    await confirmation.confirm(code);
  };

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
        <Input
          placeholder="Número de teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        {confirmation && (
          <Input
            placeholder="Código"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        )}
        <Button
          onClick={confirmation ? handleVerifyCode : handleSendCode}
          className="w-full"
        >
          <Phone className="mr-2 h-4 w-4" />
          {confirmation ? 'Verificar Código' : 'Enviar Código'}
        </Button>
        <div id="recaptcha-container" />
      </div>
    </div>
  );
};

export default Login;

