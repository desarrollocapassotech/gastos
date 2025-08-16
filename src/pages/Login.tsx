import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';

const Login = () => {
  const { signInWithGoogle, signInWithPhone, user, profile } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    if (user && profile) navigate('/');
    if (user && !profile) navigate('/register');
  }, [user, profile, navigate]);

  const handleGoogle = async () => {
    await signInWithGoogle();
  };

  const handleSendCode = async () => {
    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
    });
    const result = await signInWithPhone(phone, verifier);
    setConfirmation(result);
  };

  const handleVerifyCode = async () => {
    if (!confirmation) return;
    await confirmation.confirm(code);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
      <Button onClick={handleGoogle}>Ingresar con Google</Button>
      <div className="w-full max-w-sm space-y-2">
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
        {confirmation ? (
          <Button onClick={handleVerifyCode}>Verificar Código</Button>
        ) : (
          <Button onClick={handleSendCode}>Enviar Código</Button>
        )}
      </div>
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default Login;

