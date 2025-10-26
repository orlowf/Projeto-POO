import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LoginProps {
  onLogin: (email: string, password: string) => void;
  onSignUp: () => void;
  onForgotPassword: () => void;
}

export function Login({ onLogin, onSignUp, onForgotPassword }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validação
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Por favor, digite um email válido');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    // Simular chamada da API
    setTimeout(() => {
      onLogin(email, password);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-2xl text-gray-900">Assistente de Academia</h1>
            <p className="text-gray-600">Seu companheiro pessoal de fitness</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Bem-vindo de volta</CardTitle>
            <CardDescription className="text-center">
              Entre para continuar sua jornada fitness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-gray-50 border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-gray-50 border-gray-200"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>

              <button
                type="button"
                onClick={onForgotPassword}
                className="w-full text-blue-500 hover:text-blue-600 text-sm py-2"
              >
                Esqueceu sua senha?
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Link de Cadastro */}
        <div className="text-center">
          <p className="text-gray-600">
            Não tem uma conta?{' '}
            <button
              onClick={onSignUp}
              className="text-blue-500 hover:text-blue-600"
            >
              Cadastre-se
            </button>
          </p>
        </div>

        {/* Contas de Demonstração */}
        <Card className="border-0 bg-blue-50">
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Contas de Demonstração:</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p>Aluno: student@demo.com / password</p>
              <p>Professor: professor@demo.com / password</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}