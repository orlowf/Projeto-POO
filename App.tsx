import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import { PasswordReset } from './components/PasswordReset';
import { StudentDashboard } from './components/StudentDashboard';
import { ProfessorDashboard } from './components/ProfessorDashboard';
import { WorkoutDetail } from './components/WorkoutDetail';
import { LiveSession } from './components/LiveSession';
import { Profile } from './components/Profile';
import { Gamification } from './components/Gamification';
import { BottomNavigation } from './components/BottomNavigation';
import * as api from './utils/api';

type Screen = 'login' | 'signup' | 'password-reset' | 'dashboard' | 'workout-detail' | 'live-session' | 'profile' | 'gamification';
type UserRole = 'student' | 'professor';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface Workout {
  id: string;
  name: string;
  duration: number;
  musclesTargeted: string[];
  exercises: Exercise[];
  lastDone?: Date;
}

interface Exercise {
  id: string;
  name: string;
  machineName: string;
  primaryMuscle: string;
  sets?: number;
  reps?: number;
  duration?: number;
  restTime: number;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  duration: number;
  musclesTargeted: string[];
  exercises: Exercise[];
  assignedTo: string[];
  createdAt: Date;
}

interface Student {
  id: string;
  name: string;
  email: string;
  workoutsCompleted: number;
  lastActive: Date;
  assignedTemplates: string[];
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [user, setUser] = useState<User | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [activeTab, setActiveTab] = useState<'workouts' | 'gamification' | 'profile'>('workouts');
  const [isLoading, setIsLoading] = useState(false);

  // State para dados do backend
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Carregar dados quando o usuário fizer login
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      if (user?.role === 'student') {
        const workoutsData = await api.getWorkouts();
        setWorkouts(workoutsData.map((w: any) => ({
          ...w,
          lastDone: w.lastDone ? new Date(w.lastDone) : undefined
        })));
      } else if (user?.role === 'professor') {
        const [templatesData, studentsData] = await Promise.all([
          api.getTemplates(),
          api.getStudents()
        ]);
        
        setTemplates(templatesData.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt)
        })));
        
        setStudents(studentsData.map((s: any) => ({
          ...s,
          lastActive: new Date(s.lastActive)
        })));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await api.signIn(email, password);
      
      setUser({
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role
      });
      
      setCurrentScreen('dashboard');
      setActiveTab('workouts');
    } catch (error: any) {
      console.error('Login error:', error);
      alert(error.message || 'Falha ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (data: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'professor';
    height?: number;
    weight?: number;
    goal?: string;
  }) => {
    try {
      setIsLoading(true);
      const result = await api.signUp(data);
      
      // Fazer login automaticamente após cadastro
      await handleLogin(data.email, data.password);
    } catch (error: any) {
      console.error('SignUp error:', error);
      setIsLoading(false);
      
      // Friendly error messages
      let errorMessage = 'Falha ao criar conta. Tente novamente.';
      
      if (error.message) {
        if (error.message.includes('already been registered') || 
            error.message.includes('User already registered')) {
          errorMessage = 'Este email já está cadastrado. Por favor, faça login ou use outro email.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Email inválido. Verifique o endereço de email digitado.';
        } else if (error.message.includes('Password')) {
          errorMessage = 'Senha inválida. Use pelo menos 6 caracteres.';
        } else {
          errorMessage = error.message;
        }
      }
      
      throw new Error(errorMessage);
    }
  };

  const handleStartWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
    setCurrentScreen('live-session');
  };

  const handleViewWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
    setCurrentScreen('workout-detail');
  };

  const handleFinishWorkout = async () => {
    if (selectedWorkout) {
      try {
        await api.completeWorkout(selectedWorkout.id);
        
        // Atualizar a lista de treinos
        setWorkouts(prev => prev.map(w =>
          w.id === selectedWorkout.id
            ? { ...w, lastDone: new Date() }
            : w
        ));
      } catch (error) {
        console.error('Error completing workout:', error);
      }
    }
    
    setCurrentScreen('dashboard');
    setSelectedWorkout(null);
    setActiveTab('workouts');
  };

  const handleNavigation = (tab: 'workouts' | 'gamification' | 'profile') => {
    setActiveTab(tab);
    if (tab === 'workouts') {
      setCurrentScreen('dashboard');
    } else if (tab === 'gamification') {
      setCurrentScreen('gamification');
    } else if (tab === 'profile') {
      setCurrentScreen('profile');
    }
  };

  const handleCreateWorkout = async (newWorkout: Omit<Workout, 'id'>) => {
    try {
      const workout = await api.createWorkout(newWorkout);
      setWorkouts(prev => [...prev, workout]);
    } catch (error) {
      console.error('Error creating workout:', error);
      alert('Falha ao criar treino');
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      await api.deleteWorkout(workoutId);
      setWorkouts(prev => prev.filter(w => w.id !== workoutId));
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('Falha ao deletar treino');
    }
  };

  const handleUpdateWorkout = async (workoutId: string, updatedWorkout: Omit<Workout, 'id'>) => {
    try {
      const workout = await api.updateWorkout(workoutId, updatedWorkout);
      setWorkouts(prev => prev.map(w => 
        w.id === workoutId ? workout : w
      ));
    } catch (error) {
      console.error('Error updating workout:', error);
      alert('Falha ao atualizar treino');
    }
  };

  // Funções para professor
  const handleCreateTemplate = async (template: Omit<WorkoutTemplate, 'id' | 'createdAt'>) => {
    try {
      const newTemplate = await api.createTemplate(template);
      setTemplates(prev => [...prev, {
        ...newTemplate,
        createdAt: new Date(newTemplate.createdAt)
      }]);
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Falha ao criar template');
    }
  };

  const handleUpdateTemplate = async (id: string, template: Omit<WorkoutTemplate, 'id' | 'createdAt'>) => {
    try {
      const updatedTemplate = await api.updateTemplate(id, template);
      setTemplates(prev => prev.map(t =>
        t.id === id
          ? { ...updatedTemplate, createdAt: new Date(updatedTemplate.createdAt) }
          : t
      ));
    } catch (error) {
      console.error('Error updating template:', error);
      alert('Falha ao atualizar template');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await api.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Falha ao deletar template');
    }
  };

  const handleAssignTemplate = async (templateId: string, studentIds: string[]) => {
    try {
      await api.assignTemplate(templateId, studentIds);
      
      setTemplates(prev => prev.map(t =>
        t.id === templateId
          ? { ...t, assignedTo: studentIds }
          : t
      ));
      
      setStudents(prev => prev.map(s =>
        studentIds.includes(s.id)
          ? { 
              ...s, 
              assignedTemplates: s.assignedTemplates.includes(templateId) 
                ? s.assignedTemplates 
                : [...s.assignedTemplates, templateId] 
            }
          : { 
              ...s, 
              assignedTemplates: s.assignedTemplates.filter(id => id !== templateId) 
            }
      ));
    } catch (error) {
      console.error('Error assigning template:', error);
      alert('Falha ao atribuir template');
    }
  };

  const handleAddStudent = async (student: Omit<Student, 'id' | 'workoutsCompleted' | 'lastActive' | 'assignedTemplates'>) => {
    try {
      const newStudent = await api.addStudent(student);
      setStudents(prev => [...prev, {
        ...newStudent,
        lastActive: new Date()
      }]);
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Falha ao adicionar aluno');
    }
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'login':
        return (
          <Login
            onLogin={handleLogin}
            onSignUp={() => setCurrentScreen('signup')}
            onForgotPassword={() => setCurrentScreen('password-reset')}
          />
        );
      case 'signup':
        return (
          <SignUp
            onSignUp={handleSignUp}
            onBackToLogin={() => setCurrentScreen('login')}
          />
        );
      case 'password-reset':
        return (
          <PasswordReset
            onBackToLogin={() => setCurrentScreen('login')}
          />
        );
      case 'dashboard':
        return user?.role === 'professor' ? (
          <ProfessorDashboard 
            user={user}
            templates={templates}
            students={students}
            onCreateTemplate={handleCreateTemplate}
            onUpdateTemplate={handleUpdateTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onAssignTemplate={handleAssignTemplate}
            onAddStudent={handleAddStudent}
          />
        ) : (
          <StudentDashboard
            user={user!}
            workouts={workouts}
            onStartWorkout={handleStartWorkout}
            onViewWorkout={handleViewWorkout}
            onCreateWorkout={handleCreateWorkout}
            onDeleteWorkout={handleDeleteWorkout}
            onUpdateWorkout={handleUpdateWorkout}
          />
        );
      case 'workout-detail':
        return (
          <WorkoutDetail
            workout={selectedWorkout!}
            onStartWorkout={() => setCurrentScreen('live-session')}
            onBack={() => {
              setCurrentScreen('dashboard');
              setActiveTab('workouts');
            }}
          />
        );
      case 'live-session':
        return (
          <LiveSession
            workout={selectedWorkout!}
            onFinish={handleFinishWorkout}
            onBack={() => setCurrentScreen('workout-detail')}
          />
        );
      case 'profile':
        return (
          <Profile
            user={user!}
            onBack={() => {
              setCurrentScreen('dashboard');
              setActiveTab('workouts');
            }}
            onSignOut={() => {
              setUser(null);
              setCurrentScreen('login');
            }}
          />
        );
      case 'gamification':
        return (
          <Gamification
            onBack={() => {
              setCurrentScreen('dashboard');
              setActiveTab('workouts');
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-background min-h-screen flex flex-col">
      <div className="flex-1 overflow-hidden relative">
        {isLoading && currentScreen === 'dashboard' && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600">Carregando...</p>
            </div>
          </div>
        )}
        {renderCurrentScreen()}
      </div>
      
      {user && !['login', 'signup', 'password-reset', 'live-session'].includes(currentScreen) && (
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={handleNavigation}
          userRole={user.role}
        />
      )}
    </div>
  );
}