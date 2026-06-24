import React, { useState, useRef, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginErrors {
  email?: string;
  password?: string;
  general?: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail ou telefone é obrigatório';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Digite um e-mail válido';
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock login logic
      if (formData.email === 'admin@americanas.com' && formData.password === 'admin123') {
        // Store remember me preference
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        toast.success('Login realizado com sucesso!');
        navigate('/admin');
      } else {
        throw new Error('E-mail ou senha incorretos');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro ao fazer login';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Check for remembered email on component mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12161E] to-[#1A1F28] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1A1F28] rounded-[16px] border border-white/10 p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3DD4B9] to-[#0b7a3b] rounded-full flex items-center justify-center">
                <LogIn className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Entrar na sua conta</h1>
            <p className="text-[#8B92A0] text-sm">
              Acesse sua área administrativa da Americanas+
            </p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-4 p-3 rounded-lg bg-[#f80046]/10 border border-[#f80046]/30">
              <p className="text-sm text-[#f80046]">{errors.general}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#BFC5D0] mb-2"
              >
                E-mail ou telefone
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8B92A0]" />
                <input
                  ref={emailRef}
                  id="email"
                  type="text"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className={`w-full pl-10 pr-4 py-3 bg-[#12161E] border rounded-lg text-white placeholder-[#5E6573] focus:outline-none focus:ring-2 focus:ring-[#3DD4B9] focus:border-transparent transition-colors ${errors.email ? 'border-[#f80046]' : 'border-white/10'}`}
                  placeholder="seu@email.com"
                  disabled={isLoading}
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-[#f80046]">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#BFC5D0] mb-2"
              >
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8B92A0]" />
                <input
                  ref={passwordRef}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className={`w-full pl-10 pr-12 py-3 bg-[#12161E] border rounded-lg text-white placeholder-[#5E6573] focus:outline-none focus:ring-2 focus:ring-[#3DD4B9] focus:border-transparent transition-colors ${errors.password ? 'border-[#f80046]' : 'border-white/10'}`}
                  placeholder="Digite sua senha"
                  disabled={isLoading}
                  aria-required="true"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8B92A0] hover:text-white transition-colors"
                  disabled={isLoading}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {errors.password && (
                  <p id="password-error" className="mt-1 text-sm text-[#f80046]">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-[#12161E] text-[#3DD4B9] focus:ring-2 focus:ring-[#3DD4B9] focus:ring-offset-0"
                  disabled={isLoading}
                />
                <span className="text-sm text-[#BFC5D0]">Lembrar de mim</span>
              </label>
              <button
                type="button"
                className="text-sm text-[#3DD4B9] hover:text-[#31c4aa] transition-colors"
                disabled={isLoading}
              >
                Esqueceu a senha?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#3DD4B9] to-[#0b7a3b] hover:from-[#31c4aa] hover:to-[#0b5a2a] text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Fazendo login...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <LogIn className="w-5 h-5" />
                  <span>Entrar</span>
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-[#7A7F89] text-center">
              © 2024 Americanas+ Admin Portal. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;