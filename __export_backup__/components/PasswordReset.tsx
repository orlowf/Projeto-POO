import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react';

interface PasswordResetProps {
  onBackToLogin: () => void;
}

export function PasswordReset({ onBackToLogin }: PasswordResetProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validação
    if (!email) {
      setError('Por favor, digite seu endereço de email');
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Por favor, digite um email válido');
      setIsLoading(false);
      return;
    }

    // Simular chamada da API
    setTimeout(() => {
      setIsSuccess(true);
      setIsLoading(false);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToLogin}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl text-gray-900">Redefinir Senha</h1>
            </div>
          </div>

          {/* Mensagem de Sucesso */}
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h2 className="text-lg text-gray-900 mb-2">Verifique seu email</h2>
                  <p className="text-gray-600 text-sm mb-4">
                    Enviamos um link de redefinição de senha para <span className="font-medium">{email}</span>
                  </p>
                  <p className="text-gray-500 text-xs">
                    Não recebeu o email? Verifique sua pasta de spam ou tente novamente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voltar ao Login */}
          <Button
            onClick={onBackToLogin}
            variant="outline"
            className="w-full h-12"
          >
            Voltar ao Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToLogin}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl text-gray-900">Redefinir Senha</h1>
            <p className="text-gray-600 text-sm">Enviaremos um link de redefinição</p>
          </div>
        </div>

        {/* Formulário de Redefinição */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-blue-500" />
            </div>
            <CardTitle className="text-xl text-center">Esqueceu a Senha?</CardTitle>
            <CardDescription className="text-center">
              Digite seu endereço de email e enviaremos um link para redefinir sua senha
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
                <Label htmlFor="email">Endereço de Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-gray-50 border-gray-200"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar Link de Redefinição'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Voltar ao Login */}
        <div className="text-center">
          <button
            onClick={onBackToLogin}
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    </div>
  );
}