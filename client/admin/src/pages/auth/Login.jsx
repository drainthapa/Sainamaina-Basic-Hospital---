import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import LanguageToggle from '../../components/LanguageToggle';
import { Field, TextInput } from '../../components/FormField';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
      toast.success(t('auth.welcomeBack'));
    } catch (err) {
      setError(err.response?.data?.message || t('auth.loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-lang-row">
        <LanguageToggle />
      </div>
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <h1>सैनामैना आधारभुत अस्पताल</h1>
          <p>{t('app.title')}</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <Field label={t('auth.email')} required>
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </Field>
        <Field label={t('auth.password')} required>
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </Field>

        <Button type="submit" isLoading={isLoading} style={{ width: '100%', marginTop: 8 }}>
          {t('auth.login')}
        </Button>
      </form>
    </div>
  );
}
