import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, User, GraduationCap, Target, Ruler, Scale } from 'lucide-react';

interface SignUpProps {
  onSignUp: (data: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'professor';
    height?: number;
    weight?: number;
    goal?: string;
  }) => void;
  onBackToLogin: () => void;
}

export function SignUp({ onSignUp, onBackToLogin }: SignUpProps) {
  const [step, setStep] = useState<'role' | 'info' | 'student-details'>('role');
  const [selectedRole, setSelectedRole] = useState<'student' | 'professor' | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    height: '',
    weight: '',
    goal: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const goals = [
    'Perder peso',
    'Ganhar massa muscular',
    'Manter forma física',
    'Aumentar resistência',
    'Melhorar flexibilidade',
    'Reabilitação'
  ];

  const handleRoleSelection = (role: 'student' | 'professor') => {
    setSelectedRole(role);
    setStep('info');
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação
    if (!formData.name || !formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Por favor, digite um email válido');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    // Se for aluno, vai para a próxima etapa
    if (selectedRole === 'student') {
      setStep('student-details');
    } else {
      // Se for professor, finaliza o cadastro
      await handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      await onSignUp({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: selectedRole!,
        ...(selectedRole === 'student' && {
          height: formData.height ? parseFloat(formData.height) : undefined,
          weight: formData.weight ? parseFloat(formData.weight) : undefined,
          goal: formData.goal || undefined
        })
      });
    } catch (error: any) {
      console.error('Error in handleFinalSubmit:', error);
      setError(error.message || 'Erro ao criar conta');
      setIsLoading(false);
    }
  };

  const handleStudentDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação dos campos de aluno (opcionais mas recomendados)
    if (formData.height && parseFloat(formData.height) < 50) {
      setError('Altura inválida');
      return;
    }

    if (formData.weight && parseFloat(formData.weight) < 20) {
      setError('Peso inválido');
      return;
    }

    await handleFinalSubmit();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBack = () => {
    if (step === 'student-details') {
      setStep('info');
    } else if (step === 'info') {
      setStep('role');
      setSelectedRole(null);
    } else {
      onBackToLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl text-gray-900">Criar Conta</h1>
            <p className="text-gray-600 text-sm">
              {step === 'role' && 'Escolha seu tipo de conta'}
              {step === 'info' && 'Informações básicas'}
              {step === 'student-details' && 'Sobre você'}
            </p>
          </div>
        </div>

        {/* Step 1: Escolha de Papel */}
        {step === 'role' && (
          <div className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl text-center">Bem-vindo!</CardTitle>
                <CardDescription className="text-center">
                  Escolha como você deseja usar o Gym Assistant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <button
                  onClick={() => handleRoleSelection('student')}
                  className="w-full p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                        Sou Aluno
                      </h3>
                      <p className="text-sm text-gray-600">
                        Quero treinar e acompanhar meu progresso
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelection('professor')}
                  className="w-full p-6 rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-lg text-gray-900 group-hover:text-green-600 transition-colors">
                        Sou Professor
                      </h3>
                      <p className="text-sm text-gray-600">
                        Quero gerenciar alunos e criar treinos
                      </p>
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>

            {/* Link de Login */}
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Já tem uma conta?{' '}
                <button
                  onClick={onBackToLogin}
                  className="text-blue-500 hover:text-blue-600"
                >
                  Entrar
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Informações Básicas */}
        {step === 'info' && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedRole === 'student' 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                    : 'bg-gradient-to-br from-green-500 to-green-600'
                }`}>
                  {selectedRole === 'student' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <GraduationCap className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>
              <CardTitle className="text-xl text-center">
                {selectedRole === 'student' ? 'Cadastro de Aluno' : 'Cadastro de Professor'}
              </CardTitle>
              <CardDescription className="text-center">
                Preencha suas informações básicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInfoSubmit} className="space-y-4">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Digite seu nome completo"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="h-12 bg-gray-50 border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Digite seu email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="h-12 bg-gray-50 border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Crie uma senha (mínimo 6 caracteres)"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="h-12 bg-gray-50 border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="h-12 bg-gray-50 border-gray-200"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full h-12 ${
                    selectedRole === 'student'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                  } disabled:opacity-50`}
                >
                  {isLoading ? 'Criando...' : (selectedRole === 'student' ? 'Próximo' : 'Criar Conta')}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Detalhes do Aluno (apenas para alunos) */}
        {step === 'student-details' && selectedRole === 'student' && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
              </div>
              <CardTitle className="text-xl text-center">Quase lá!</CardTitle>
              <CardDescription className="text-center">
                Conte-nos um pouco sobre você para personalizar sua experiência
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStudentDetailsSubmit} className="space-y-4">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-blue-900">
                    💡 Essas informações são opcionais, mas nos ajudam a personalizar seus treinos
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height" className="flex items-center space-x-2">
                    <Ruler className="w-4 h-4" />
                    <span>Altura (cm)</span>
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 175"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    className="h-12 bg-gray-50 border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center space-x-2">
                    <Scale className="w-4 h-4" />
                    <span>Peso (kg)</span>
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 70"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="h-12 bg-gray-50 border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Objetivo Principal</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {goals.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => handleInputChange('goal', goal)}
                        className={`p-3 rounded-lg border-2 text-sm transition-all ${
                          formData.goal === goal
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleFinalSubmit()}
                    className="flex-1 h-12"
                    disabled={isLoading}
                  >
                    Pular
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Criando...' : 'Finalizar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
