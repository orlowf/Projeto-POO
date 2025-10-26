import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Plus, Play, Eye, Trash2, Calendar, Clock, Target, Edit, X, Save } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
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

interface Workout {
  id: string;
  name: string;
  duration: number;
  musclesTargeted: string[];
  exercises: Exercise[];
  lastDone?: Date;
}

interface StudentDashboardProps {
  user: User;
  workouts: Workout[];
  onStartWorkout: (workout: Workout) => void;
  onViewWorkout: (workout: Workout) => void;
  onCreateWorkout?: (workout: Omit<Workout, 'id'>) => void;
  onDeleteWorkout?: (workoutId: string) => void;
  onUpdateWorkout?: (workoutId: string, workout: Omit<Workout, 'id'>) => void;
}

export function StudentDashboard({ user, workouts, onStartWorkout, onViewWorkout, onCreateWorkout, onDeleteWorkout, onUpdateWorkout }: StudentDashboardProps) {
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);
  const [newWorkout, setNewWorkout] = useState({
    name: '',
    duration: 30,
    musclesTargeted: [] as string[],
    exercises: [] as Exercise[]
  });
  const [newExercise, setNewExercise] = useState({
    name: '',
    machineName: '',
    primaryMuscle: '',
    sets: 3,
    reps: 10,
    restTime: 60
  });
  const [showExerciseForm, setShowExerciseForm] = useState(false);

  const formatLastDone = (date?: Date) => {
    if (!date) return 'Nunca';
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    return `${days} dias atrás`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const today = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const muscleOptions = [
    'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 
    'Pernas', 'Abdômen', 'Glúteos', 'Antebraços', 'Cardio'
  ];

  const openCreateModal = () => {
    setEditingWorkoutId(null);
    setNewWorkout({
      name: '',
      duration: 30,
      musclesTargeted: [],
      exercises: []
    });
    setShowWorkoutModal(true);
  };

  const openEditModal = (workout: Workout) => {
    setEditingWorkoutId(workout.id);
    setNewWorkout({
      name: workout.name,
      duration: workout.duration,
      musclesTargeted: workout.musclesTargeted,
      exercises: workout.exercises
    });
    setShowWorkoutModal(true);
  };

  const handleSaveWorkout = () => {
    if (!newWorkout.name.trim()) {
      return;
    }
    
    if (editingWorkoutId && onUpdateWorkout) {
      // Editando treino existente
      onUpdateWorkout(editingWorkoutId, {
        name: newWorkout.name,
        duration: newWorkout.duration,
        musclesTargeted: newWorkout.musclesTargeted,
        exercises: newWorkout.exercises
      });
    } else if (onCreateWorkout) {
      // Criando novo treino
      onCreateWorkout({
        name: newWorkout.name,
        duration: newWorkout.duration,
        musclesTargeted: newWorkout.musclesTargeted,
        exercises: newWorkout.exercises
      });
    }
    
    // Reset form
    setNewWorkout({
      name: '',
      duration: 30,
      musclesTargeted: [],
      exercises: []
    });
    setEditingWorkoutId(null);
    setShowWorkoutModal(false);
    setShowExerciseForm(false);
  };

  const handleDeleteWorkout = (workoutId: string) => {
    if (onDeleteWorkout) {
      onDeleteWorkout(workoutId);
    }
    setWorkoutToDelete(null);
  };

  const toggleMuscle = (muscle: string) => {
    setNewWorkout(prev => ({
      ...prev,
      musclesTargeted: prev.musclesTargeted.includes(muscle)
        ? prev.musclesTargeted.filter(m => m !== muscle)
        : [...prev.musclesTargeted, muscle]
    }));
  };

  const handleAddExercise = () => {
    if (!newExercise.name.trim() || !newExercise.machineName.trim() || !newExercise.primaryMuscle.trim()) {
      return;
    }

    const exercise: Exercise = {
      id: Date.now().toString(),
      name: newExercise.name,
      machineName: newExercise.machineName,
      primaryMuscle: newExercise.primaryMuscle,
      sets: newExercise.sets,
      reps: newExercise.reps,
      restTime: newExercise.restTime
    };

    setNewWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, exercise]
    }));

    // Reset exercise form
    setNewExercise({
      name: '',
      machineName: '',
      primaryMuscle: '',
      sets: 3,
      reps: 10,
      restTime: 60
    });
    setShowExerciseForm(false);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setNewWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter(e => e.id !== exerciseId)
    }));
  };

  const closeModal = () => {
    setShowWorkoutModal(false);
    setShowExerciseForm(false);
    setEditingWorkoutId(null);
    setNewWorkout({
      name: '',
      duration: 30,
      musclesTargeted: [],
      exercises: []
    });
    setNewExercise({
      name: '',
      machineName: '',
      primaryMuscle: '',
      sets: 3,
      reps: 10,
      restTime: 60
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl text-gray-900">{getGreeting()}, {user.name.split(' ')[0]}!</h1>
            <p className="text-sm text-gray-600">{today}</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="p-4">
        <Card className="bg-gradient-to-r from-blue-500 to-green-500 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-lg mb-2">Pronto para conquistar seus objetivos?</h2>
                <p className="text-blue-100 text-sm mb-4">
                  Inicie um treino e acompanhe seu progresso
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Target className="w-4 h-4" />
                    <span>Sequência de 7 dias</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>12 treinos este mês</span>
                  </div>
                </div>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Play className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workouts Section */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg text-gray-900">Meus Treinos</h2>
          <Button
            onClick={openCreateModal}
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Treino
          </Button>
        </div>

        {workouts.length === 0 ? (
          <Card className="border-0 bg-white">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg text-gray-900 mb-2">Nenhum treino ainda</h3>
              <p className="text-gray-600 text-sm mb-6">
                Crie seu primeiro treino e comece sua jornada fitness!
              </p>
              <Button
                onClick={openCreateModal}
                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Treino
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {workouts.map((workout) => (
              <Card key={workout.id} className="border-0 bg-white shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg text-gray-900 mb-1">{workout.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{workout.duration} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Último: {formatLastDone(workout.lastDone)}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {workout.musclesTargeted.map((muscle) => (
                          <Badge key={muscle} variant="secondary" className="text-xs">
                            {muscle}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => onStartWorkout(workout)}
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 flex-1"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Iniciar
                      </Button>
                      <Button
                        onClick={() => onViewWorkout(workout)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => openEditModal(workout)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        onClick={() => setWorkoutToDelete(workout.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-500 hover:text-red-600 border-red-200 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Deletar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Criar/Editar Treino */}
      {showWorkoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-3xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl text-gray-900">
                    {editingWorkoutId ? 'Editar Treino' : 'Criar Novo Treino'}
                  </h2>
                  <p className="text-sm text-gray-600">Defina os detalhes do seu treino</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModal}
                  className="p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Nome do Treino */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">Nome do Treino</label>
                <input
                  type="text"
                  value={newWorkout.name}
                  onChange={(e) => setNewWorkout(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Treino A - Peito e Tríceps"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Duração */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Duração estimada: {newWorkout.duration} minutos
                </label>
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="5"
                  value={newWorkout.duration}
                  onChange={(e) => setNewWorkout(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>15 min</span>
                  <span>120 min</span>
                </div>
              </div>

              {/* Grupos Musculares */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">Grupos Musculares</label>
                <div className="flex flex-wrap gap-2">
                  {muscleOptions.map((muscle) => (
                    <button
                      key={muscle}
                      onClick={() => toggleMuscle(muscle)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        newWorkout.musclesTargeted.includes(muscle)
                          ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {muscle}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de Exercícios */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm text-gray-700">
                    Exercícios ({newWorkout.exercises.length})
                  </label>
                  {!showExerciseForm && (
                    <Button
                      onClick={() => setShowExerciseForm(true)}
                      size="sm"
                      variant="outline"
                      className="h-8"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  )}
                </div>

                {/* Exercícios Adicionados */}
                {newWorkout.exercises.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {newWorkout.exercises.map((exercise, index) => (
                      <div key={exercise.id} className="bg-gray-50 rounded-lg p-3 flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{index + 1}. {exercise.name}</p>
                          <p className="text-xs text-gray-600">{exercise.machineName}</p>
                          <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                            <span>{exercise.sets} séries</span>
                            <span>•</span>
                            <span>{exercise.reps} reps</span>
                            <span>•</span>
                            <span>{exercise.restTime}s descanso</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleRemoveExercise(exercise.id)}
                          variant="ghost"
                          size="sm"
                          className="p-1 h-auto text-red-500 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulário de Adicionar Exercício */}
                {showExerciseForm && (
                  <div className="bg-blue-50 rounded-xl p-4 space-y-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm text-blue-900">Novo Exercício</h3>
                      <Button
                        onClick={() => setShowExerciseForm(false)}
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={newExercise.name}
                        onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nome do exercício"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={newExercise.machineName}
                        onChange={(e) => setNewExercise(prev => ({ ...prev, machineName: e.target.value }))}
                        placeholder="Nome da máquina/equipamento"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <select
                        value={newExercise.primaryMuscle}
                        onChange={(e) => setNewExercise(prev => ({ ...prev, primaryMuscle: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">Selecione o músculo principal</option>
                        {muscleOptions.map(muscle => (
                          <option key={muscle} value={muscle}>{muscle}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Séries</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={newExercise.sets}
                          onChange={(e) => setNewExercise(prev => ({ ...prev, sets: parseInt(e.target.value) || 1 }))}
                          className="w-full px-2 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Reps</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={newExercise.reps}
                          onChange={(e) => setNewExercise(prev => ({ ...prev, reps: parseInt(e.target.value) || 1 }))}
                          className="w-full px-2 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Descanso (s)</label>
                        <input
                          type="number"
                          min="0"
                          max="300"
                          step="15"
                          value={newExercise.restTime}
                          onChange={(e) => setNewExercise(prev => ({ ...prev, restTime: parseInt(e.target.value) || 0 }))}
                          className="w-full px-2 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleAddExercise}
                      disabled={!newExercise.name.trim() || !newExercise.machineName.trim() || !newExercise.primaryMuscle}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Exercício
                    </Button>
                  </div>
                )}

                {newWorkout.exercises.length === 0 && !showExerciseForm && (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">
                      Nenhum exercício adicionado ainda
                    </p>
                  </div>
                )}
              </div>

              {/* Botões */}
              <div className="flex space-x-3 pt-2">
                <Button
                  onClick={closeModal}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveWorkout}
                  disabled={!newWorkout.name.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingWorkoutId ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {workoutToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <Card className="w-full max-w-sm bg-white">
            <CardHeader>
              <CardTitle className="text-red-600">Deletar Treino</CardTitle>
              <CardDescription>
                Tem certeza que deseja deletar este treino? Esta ação não pode ser desfeita.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex space-x-3">
              <Button
                onClick={() => setWorkoutToDelete(null)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => handleDeleteWorkout(workoutToDelete)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                Deletar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}