import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Plus, Users, FileText, TrendingUp, Eye, Edit, Trash2, Calendar, Dumbbell, X, Save, User as UserIcon } from 'lucide-react';

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
  restTime: number;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  duration: number;
  musclesTargeted: string[];
  exercises: Exercise[];
  assignedTo: string[]; // Array de IDs de estudantes
  createdAt: Date;
}

interface Student {
  id: string;
  name: string;
  email: string;
  workoutsCompleted: number;
  lastActive: Date;
  assignedTemplates: string[]; // Array de IDs de templates
}

interface ProfessorDashboardProps {
  user: User;
  templates: WorkoutTemplate[];
  students: Student[];
  onCreateTemplate?: (template: Omit<WorkoutTemplate, 'id' | 'createdAt'>) => void;
  onUpdateTemplate?: (id: string, template: Omit<WorkoutTemplate, 'id' | 'createdAt'>) => void;
  onDeleteTemplate?: (id: string) => void;
  onAssignTemplate?: (templateId: string, studentIds: string[]) => void;
  onAddStudent?: (student: Omit<Student, 'id' | 'workoutsCompleted' | 'lastActive' | 'assignedTemplates'>) => void;
}

export function ProfessorDashboard({ 
  user, 
  templates = [], 
  students = [],
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onAssignTemplate,
  onAddStudent
}: ProfessorDashboardProps) {
  const [activeSection, setActiveSection] = useState<'templates' | 'students'>('templates');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [selectedTemplateForAssign, setSelectedTemplateForAssign] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    duration: 45,
    musclesTargeted: [] as string[],
    exercises: [] as Exercise[],
    assignedTo: [] as string[]
  });

  const [newStudent, setNewStudent] = useState({
    name: '',
    email: ''
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

  const muscleOptions = [
    'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 
    'Pernas', 'Abdômen', 'Glúteos', 'Antebraços', 'Cardio'
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      day: 'numeric',
      month: 'short'
    });
  };

  const formatLastActive = (date: Date) => {
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

  const totalStudents = students.length;
  const activeStudents = students.filter(s => 
    (Date.now() - s.lastActive.getTime()) / (1000 * 60 * 60 * 24) <= 7
  ).length;
  const totalTemplates = templates.length;

  const openCreateTemplate = () => {
    setEditingTemplate(null);
    setNewTemplate({
      name: '',
      description: '',
      duration: 45,
      musclesTargeted: [],
      exercises: [],
      assignedTo: []
    });
    setShowTemplateModal(true);
  };

  const openEditTemplate = (template: WorkoutTemplate) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      description: template.description,
      duration: template.duration,
      musclesTargeted: template.musclesTargeted,
      exercises: template.exercises,
      assignedTo: template.assignedTo
    });
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = () => {
    if (!newTemplate.name.trim()) return;

    if (editingTemplate && onUpdateTemplate) {
      onUpdateTemplate(editingTemplate.id, newTemplate);
    } else if (onCreateTemplate) {
      onCreateTemplate(newTemplate);
    }

    closeTemplateModal();
  };

  const closeTemplateModal = () => {
    setShowTemplateModal(false);
    setEditingTemplate(null);
    setShowExerciseForm(false);
    setNewTemplate({
      name: '',
      description: '',
      duration: 45,
      musclesTargeted: [],
      exercises: [],
      assignedTo: []
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

  const handleDeleteTemplate = (id: string) => {
    if (onDeleteTemplate) {
      onDeleteTemplate(id);
    }
    setTemplateToDelete(null);
  };

  const toggleMuscle = (muscle: string) => {
    setNewTemplate(prev => ({
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

    setNewTemplate(prev => ({
      ...prev,
      exercises: [...prev.exercises, exercise]
    }));

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
    setNewTemplate(prev => ({
      ...prev,
      exercises: prev.exercises.filter(e => e.id !== exerciseId)
    }));
  };

  const handleAddStudent = () => {
    if (!newStudent.name.trim() || !newStudent.email.trim()) return;

    if (onAddStudent) {
      onAddStudent(newStudent);
    }

    setNewStudent({ name: '', email: '' });
    setShowStudentModal(false);
  };

  const openAssignModal = (templateId: string) => {
    setSelectedTemplateForAssign(templateId);
    const template = templates.find(t => t.id === templateId);
    setSelectedStudents(template?.assignedTo || []);
    setShowAssignModal(true);
  };

  const handleAssignTemplate = () => {
    if (selectedTemplateForAssign && onAssignTemplate) {
      onAssignTemplate(selectedTemplateForAssign, selectedStudents);
    }
    setShowAssignModal(false);
    setSelectedTemplateForAssign(null);
    setSelectedStudents([]);
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl text-gray-900">{getGreeting()}, {user.name.split(' ')[0]}!</h1>
            <p className="text-sm text-gray-600">Painel do Professor</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl text-gray-900">{totalStudents}</p>
              <p className="text-sm text-gray-600">Alunos</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl text-gray-900">{activeStudents}</p>
              <p className="text-sm text-gray-600">Ativos</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="p-4 text-center">
              <FileText className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl text-gray-900">{totalTemplates}</p>
              <p className="text-sm text-gray-600">Templates</p>
            </CardContent>
          </Card>
        </div>

        {/* Section Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
          <button
            onClick={() => setActiveSection('templates')}
            className={`flex-1 py-2 px-4 rounded-md text-sm transition-colors ${
              activeSection === 'templates'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Templates de Treino
          </button>
          <button
            onClick={() => setActiveSection('students')}
            className={`flex-1 py-2 px-4 rounded-md text-sm transition-colors ${
              activeSection === 'students'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Alunos
          </button>
        </div>

        {/* Templates Section */}
        {activeSection === 'templates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg text-gray-900">Templates de Treino</h2>
              <Button
                onClick={openCreateTemplate}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Template
              </Button>
            </div>

            {templates.length === 0 ? (
              <Card className="border-0 bg-white">
                <CardContent className="py-12 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg text-gray-900 mb-2">Nenhum template ainda</h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Crie templates de treino para atribuir aos seus alunos
                  </p>
                  <Button
                    onClick={openCreateTemplate}
                    className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Template
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {templates.map((template) => (
                  <Card key={template.id} className="border-0 bg-white shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg text-gray-900 mb-1">{template.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center space-x-1">
                              <Dumbbell className="w-4 h-4" />
                              <span>{template.exercises.length} exercícios</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{template.assignedTo.length} alunos</span>
                            </div>
                            <span>•</span>
                            <span>{formatDate(template.createdAt)}</span>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {template.musclesTargeted.slice(0, 3).map((muscle) => (
                              <Badge key={muscle} variant="secondary" className="text-xs">
                                {muscle}
                              </Badge>
                            ))}
                            {template.musclesTargeted.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{template.musclesTargeted.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => openAssignModal(template.id)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Atribuir
                          </Button>
                          <Button
                            onClick={() => openEditTemplate(template)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                        </div>
                        <Button
                          onClick={() => setTemplateToDelete(template.id)}
                          variant="outline"
                          size="sm"
                          className="w-full text-red-500 hover:text-red-600 border-red-200 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Deletar Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Students Section */}
        {activeSection === 'students' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg text-gray-900">Alunos</h2>
              <Button
                onClick={() => setShowStudentModal(true)}
                size="sm"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Aluno
              </Button>
            </div>

            {students.length === 0 ? (
              <Card className="border-0 bg-white">
                <CardContent className="py-12 text-center">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg text-gray-900 mb-2">Nenhum aluno cadastrado</h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Adicione alunos para começar a gerenciar seus treinos
                  </p>
                  <Button
                    onClick={() => setShowStudentModal(true)}
                    className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Aluno
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {students.map((student) => {
                  const assignedTemplateCount = student.assignedTemplates.length;
                  return (
                    <Card key={student.id} className="border-0 bg-white shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-medium">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-gray-900 mb-1 truncate">{student.name}</h3>
                            <p className="text-sm text-gray-600 mb-2 truncate">{student.email}</p>
                            
                            <div className="flex items-center space-x-3 text-sm text-gray-500">
                              <span>{student.workoutsCompleted} treinos</span>
                              <span>•</span>
                              <span>{assignedTemplateCount} templates</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Último acesso: {formatLastActive(student.lastActive)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Criar/Editar Template */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-3xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl text-gray-900">
                    {editingTemplate ? 'Editar Template' : 'Novo Template'}
                  </h2>
                  <p className="text-sm text-gray-600">Configure o template de treino</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeTemplateModal}
                  className="p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Nome do Template</label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Treino Full Body Iniciante"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Descrição</label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o objetivo deste template..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Duração estimada: {newTemplate.duration} minutos
                </label>
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="5"
                  value={newTemplate.duration}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>15 min</span>
                  <span>120 min</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Grupos Musculares</label>
                <div className="flex flex-wrap gap-2">
                  {muscleOptions.map((muscle) => (
                    <button
                      key={muscle}
                      onClick={() => toggleMuscle(muscle)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        newTemplate.musclesTargeted.includes(muscle)
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
                    Exercícios ({newTemplate.exercises.length})
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

                {newTemplate.exercises.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {newTemplate.exercises.map((exercise, index) => (
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

                    <input
                      type="text"
                      value={newExercise.name}
                      onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome do exercício"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />

                    <input
                      type="text"
                      value={newExercise.machineName}
                      onChange={(e) => setNewExercise(prev => ({ ...prev, machineName: e.target.value }))}
                      placeholder="Nome da máquina/equipamento"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />

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

                {newTemplate.exercises.length === 0 && !showExerciseForm && (
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
                  onClick={closeTemplateModal}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveTemplate}
                  disabled={!newTemplate.name.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingTemplate ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adicionar Aluno */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <Card className="w-full max-w-sm bg-white">
            <CardHeader>
              <CardTitle>Adicionar Aluno</CardTitle>
              <CardDescription>Cadastre um novo aluno para gerenciar seus treinos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: João Silva"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">E-mail</label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="joao@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <Button
                  onClick={() => {
                    setShowStudentModal(false);
                    setNewStudent({ name: '', email: '' });
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddStudent}
                  disabled={!newStudent.name.trim() || !newStudent.email.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 disabled:opacity-50"
                >
                  Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Atribuir Template */}
      {showAssignModal && selectedTemplateForAssign && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-3xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl text-gray-900">Atribuir Template</h2>
                  <p className="text-sm text-gray-600">
                    {templates.find(t => t.id === selectedTemplateForAssign)?.name}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedTemplateForAssign(null);
                    setSelectedStudents([]);
                  }}
                  className="p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Selecione os alunos que receberão este template de treino
              </p>

              {students.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Nenhum aluno cadastrado</p>
                </div>
              ) : (
                students.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => toggleStudentSelection(student.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedStudents.includes(student.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-medium">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{student.name}</p>
                        <p className="text-xs text-gray-600 truncate">{student.email}</p>
                      </div>
                      {selectedStudents.includes(student.id) && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedTemplateForAssign(null);
                    setSelectedStudents([]);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAssignTemplate}
                  disabled={selectedStudents.length === 0}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 disabled:opacity-50"
                >
                  Atribuir ({selectedStudents.length})
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {templateToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <Card className="w-full max-w-sm bg-white">
            <CardHeader>
              <CardTitle className="text-red-600">Deletar Template</CardTitle>
              <CardDescription>
                Tem certeza que deseja deletar este template? Esta ação não pode ser desfeita.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex space-x-3">
              <Button
                onClick={() => setTemplateToDelete(null)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => handleDeleteTemplate(templateToDelete)}
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
