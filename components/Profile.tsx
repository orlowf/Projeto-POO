import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { ArrowLeft, Edit, User, Mail, Target, Ruler, Scale, Trophy, Settings, Bell, Lock, LogOut, X, FileText, Users } from 'lucide-react';
import * as api from '../utils/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'professor';
}

interface ProfileProps {
  user: User;
  onBack: () => void;
  onSignOut?: () => void;
}

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'professor';
  goal?: string;
  height?: number;
  weight?: number;
  rank?: string;
  streakCount?: number;
  workoutsCompleted?: number;
  monthlyWorkouts?: number;
  totalPoints?: number;
}

export function Profile({ user, onBack, onSignOut }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    goal: '',
    height: '',
    weight: '',
  });

  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    achievementAlerts: true,
    weeklyProgress: true,
    emailNotifications: false,
    pushNotifications: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showStats: true,
    shareProgress: false
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const data = await api.getProfileData();
      setProfileData(data);
      
      setFormData({
        name: data.name,
        email: data.email,
        goal: data.goal || '',
        height: data.height ? `${data.height}` : '',
        weight: data.weight ? `${data.weight}` : '',
      });
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.updateProfile({
        name: formData.name,
        email: formData.email,
        goal: formData.goal,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
      });
      
      await loadProfileData();
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Erro ao salvar perfil');
    }
  };

  const handleSignOut = () => {
    setShowSignOutConfirm(false);
    if (onSignOut) {
      onSignOut();
    }
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Erro ao carregar perfil</p>
            <Button onClick={onBack} className="mt-4">
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const studentStats = [
    { label: 'Sequência Atual', value: `${profileData.streakCount || 0} dias`, icon: Target },
    { label: 'Total de Treinos', value: `${profileData.workoutsCompleted || 0}`, icon: Trophy },
    { label: 'Este Mês', value: `${profileData.monthlyWorkouts || 0} treinos`, icon: Target },
    { label: 'Total de Pontos', value: `${profileData.totalPoints || 0}`, icon: Trophy }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl text-gray-900">Perfil</h1>
              <p className="text-sm text-gray-600">Gerencie sua conta</p>
            </div>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Header */}
        <Card className="border-0 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">
                  {formData.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl text-gray-900 mb-1">{formData.name}</h2>
                  <p className="text-gray-600">{formData.email}</p>
                  <p className="text-sm text-blue-600 capitalize mt-1">
                    {user.role === 'student' ? 'Aluno' : 'Professor'}
                  </p>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex space-x-3">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                >
                  Salvar Alterações
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: profileData.name,
                      email: profileData.email,
                      goal: profileData.goal || '',
                      height: profileData.height ? `${profileData.height}` : '',
                      weight: profileData.weight ? `${profileData.weight}` : '',
                    });
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student-specific sections */}
        {user.role === 'student' && (
          <>
            {/* Personal Info */}
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Informações Pessoais</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="goal">Objetivo Fitness</Label>
                      <Input
                        id="goal"
                        value={formData.goal}
                        onChange={(e) => handleInputChange('goal', e.target.value)}
                        className="mt-1"
                        placeholder="Ex: Ganhar massa muscular"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="height">Altura (m)</Label>
                        <Input
                          id="height"
                          value={formData.height}
                          onChange={(e) => handleInputChange('height', e.target.value)}
                          className="mt-1"
                          placeholder="Ex: 1.75"
                          type="number"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Label htmlFor="weight">Peso (kg)</Label>
                        <Input
                          id="weight"
                          value={formData.weight}
                          onChange={(e) => handleInputChange('weight', e.target.value)}
                          className="mt-1"
                          placeholder="Ex: 75"
                          type="number"
                          step="0.1"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-3">
                      <Target className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-gray-500">Objetivo</p>
                        <p className="text-gray-900">{formData.goal || 'Não definido'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="text-gray-500">Rank</p>
                        <p className="text-gray-900">{profileData.rank || 'Bronze'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Ruler className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-gray-500">Altura</p>
                        <p className="text-gray-900">
                          {profileData.height ? `${profileData.height} m` : 'Não informado'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Scale className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-gray-500">Peso</p>
                        <p className="text-gray-900">
                          {profileData.weight ? `${profileData.weight} kg` : 'Não informado'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Suas Estatísticas</CardTitle>
                <CardDescription>Acompanhe seu progresso e conquistas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {studentStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                        <Icon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                        <p className="text-lg text-gray-900">{stat.value}</p>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>
                
                {/* Debug button - remove in production */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    onClick={async () => {
                      if (window.confirm('Tem certeza que deseja resetar todas as estatísticas? Esta ação não pode ser desfeita.')) {
                        try {
                          console.log('Attempting to reset stats...');
                          
                          // Try simple reset first
                          const result = await api.resetStats(true);
                          console.log('Reset result:', result);
                          
                          alert('Estatísticas resetadas com sucesso!');
                          
                          // Reload the page to refresh all data
                          window.location.reload();
                        } catch (error: any) {
                          console.error('Error resetting stats:', error);
                          
                          // Show detailed error
                          let errorMsg = 'Erro desconhecido';
                          if (error?.message) {
                            errorMsg = error.message;
                          } else if (typeof error === 'string') {
                            errorMsg = error;
                          }
                          
                          alert(`Erro ao resetar estatísticas:\n${errorMsg}\n\nVerifique o console para mais detalhes.`);
                        }
                      }
                    }}
                    variant="outline"
                    className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                    size="sm"
                  >
                    🔄 Resetar Estatísticas (Debug)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Professor-specific section */}
        {user.role === 'professor' && (
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span>Informações do Professor</span>
              </CardTitle>
              <CardDescription>Seu desempenho como educador</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                  <FileText className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl text-gray-900">Templates</p>
                  <p className="text-xs text-gray-600 mt-1">Gerencie na Home</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
                  <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl text-gray-900">Alunos</p>
                  <p className="text-xs text-gray-600 mt-1">Gerencie na Home</p>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-900">
                  💡 Acesse a página inicial para gerenciar seus templates de treino e alunos
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings */}
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Configurações</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => setShowNotifications(true)}
              variant="outline" 
              className="w-full justify-start"
            >
              <Bell className="w-4 h-4 mr-2" />
              Preferências de Notificação
            </Button>
            <Button 
              onClick={() => setShowPrivacy(true)}
              variant="outline" 
              className="w-full justify-start"
            >
              <Lock className="w-4 h-4 mr-2" />
              Configurações de Privacidade
            </Button>
            <Button 
              onClick={() => setShowSignOutConfirm(true)}
              variant="outline" 
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair da Conta
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Notificações */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-3xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl text-gray-900">Notificações</h2>
                  <p className="text-sm text-gray-600">Gerencie suas preferências</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(false)}
                  className="p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    {user.role === 'professor' ? 'Atualizações de Alunos' : 'Lembretes de Treino'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {user.role === 'professor' 
                      ? 'Seja notificado quando alunos completarem treinos' 
                      : 'Receba lembretes para seus treinos'}
                  </p>
                </div>
                <Switch
                  checked={notifications.workoutReminders}
                  onCheckedChange={() => handleNotificationToggle('workoutReminders')}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    {user.role === 'professor' ? 'Alertas de Atividade' : 'Alertas de Conquistas'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {user.role === 'professor' 
                      ? 'Notificações sobre atividades importantes' 
                      : 'Seja notificado sobre novas conquistas'}
                  </p>
                </div>
                <Switch
                  checked={notifications.achievementAlerts}
                  onCheckedChange={() => handleNotificationToggle('achievementAlerts')}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    {user.role === 'professor' ? 'Relatório Semanal' : 'Progresso Semanal'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {user.role === 'professor' 
                      ? 'Resumo semanal do desempenho dos alunos' 
                      : 'Resumo semanal do seu progresso'}
                  </p>
                </div>
                <Switch
                  checked={notifications.weeklyProgress}
                  onCheckedChange={() => handleNotificationToggle('weeklyProgress')}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Notificações por E-mail</p>
                  <p className="text-xs text-gray-600">Receba notificações no seu e-mail</p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={() => handleNotificationToggle('emailNotifications')}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Notificações Push</p>
                  <p className="text-xs text-gray-600">Receba notificações no dispositivo</p>
                </div>
                <Switch
                  checked={notifications.pushNotifications}
                  onCheckedChange={() => handleNotificationToggle('pushNotifications')}
                />
              </div>

              <Button
                onClick={() => setShowNotifications(false)}
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 mt-4"
              >
                Salvar Preferências
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Privacidade */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-3xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl text-gray-900">Privacidade</h2>
                  <p className="text-sm text-gray-600">Controle suas informações</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPrivacy(false)}
                  className="p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-900 mb-2">Visibilidade do Perfil</label>
                <select
                  value={privacy.profileVisibility}
                  onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="public">Público</option>
                  {user.role === 'student' && <option value="friends">Apenas Amigos</option>}
                  <option value="private">Privado</option>
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  {user.role === 'professor' 
                    ? 'Controle quem pode ver seu perfil de professor' 
                    : 'Quem pode ver seu perfil'}
                </p>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Mostrar Estatísticas</p>
                  <p className="text-xs text-gray-600">
                    {user.role === 'professor' 
                      ? 'Exibir estatísticas de ensino publicamente' 
                      : 'Exibir suas estatísticas publicamente'}
                  </p>
                </div>
                <Switch
                  checked={privacy.showStats}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showStats: checked }))}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    {user.role === 'professor' ? 'Compartilhar Templates' : 'Compartilhar Progresso'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {user.role === 'professor' 
                      ? 'Permitir que outros professores vejam seus templates' 
                      : 'Permitir compartilhamento do progresso'}
                  </p>
                </div>
                <Switch
                  checked={privacy.shareProgress}
                  onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, shareProgress: checked }))}
                />
              </div>

              <div className="bg-blue-50 rounded-xl p-4 mt-4">
                <p className="text-sm text-blue-900">
                  🔒 Suas informações estão seguras conosco. Nunca compartilhamos seus dados com terceiros.
                </p>
              </div>

              <Button
                onClick={() => setShowPrivacy(false)}
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 mt-4"
              >
                Salvar Configurações
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Sair */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <Card className="w-full max-w-sm bg-white">
            <CardHeader>
              <CardTitle className="text-red-600">Sair da Conta</CardTitle>
              <CardDescription>
                Tem certeza que deseja sair? Você precisará fazer login novamente para acessar sua conta.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex space-x-3">
              <Button
                onClick={() => setShowSignOutConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSignOut}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                Sair
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
