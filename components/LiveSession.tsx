import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ArrowLeft, Play, Pause, SkipForward, CheckCircle, Clock } from 'lucide-react';

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
}

interface LiveSessionProps {
  workout: Workout;
  onFinish: () => void;
  onBack: () => void;
}

export function LiveSession({ workout, onFinish, onBack }: LiveSessionProps) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const currentExercise = workout.exercises[currentExerciseIndex];
  const totalExercises = workout.exercises.length;
  const progress = totalExercises > 0 
    ? ((currentExerciseIndex + (currentSet / (currentExercise?.sets || 1))) / totalExercises) * 100
    : 0;

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - sessionStartTime);
      
      if (!isPaused && timeRemaining > 0) {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, timeRemaining, sessionStartTime]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return secs.toString();
  };

  const startRest = () => {
    if (!currentExercise) return;
    setIsResting(true);
    setTimeRemaining(currentExercise.restTime);
  };

  const nextSet = () => {
    if (currentSet < (currentExercise.sets || 1)) {
      setCurrentSet(prev => prev + 1);
      setIsResting(false);
      setTimeRemaining(0);
    } else {
      nextExercise();
    }
  };

  const nextExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
      setIsResting(false);
      setTimeRemaining(0);
    } else {
      setShowFinishModal(true);
    }
  };

  const skipExercise = () => {
    nextExercise();
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  // Treino sem exercícios
  if (totalExercises === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-xl text-gray-900 mb-2">Treino Vazio</h2>
            <p className="text-gray-600 text-sm mb-6">
              Este treino ainda não possui exercícios. Adicione exercícios para começar a treinar!
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={onBack}
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              >
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showFinishModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl text-gray-900 mb-2">Treino Completo!</h2>
            <p className="text-gray-600 text-sm mb-4">
              Ótimo trabalho finalizando sua sessão de treino.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">Duração</p>
                <p className="text-gray-900">{formatTime(elapsedTime)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-500">Exercícios</p>
                <p className="text-gray-900">{totalExercises}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  if (!isFinishing) {
                    setIsFinishing(true);
                    onFinish();
                  }
                }}
                disabled={isFinishing}
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 disabled:opacity-50"
              >
                {isFinishing ? 'Finalizando...' : 'Finalizar Sessão'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-lg text-gray-900">{workout.name}</h1>
            <p className="text-sm text-gray-600">
              Exercício {currentExerciseIndex + 1} de {totalExercises}
            </p>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            {formatTime(elapsedTime)}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="p-4">
        <div className="mb-2 flex justify-between text-sm text-gray-600">
          <span>Progresso</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Current Exercise */}
      <div className="p-4 space-y-4">
        <Card className="border-0 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl text-gray-900 mb-2">{currentExercise.name}</h2>
              <p className="text-gray-600 mb-4">{currentExercise.machineName}</p>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {currentExercise.primaryMuscle}
              </Badge>
            </div>

            {/* Set Information */}
            <div className="text-center mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Série Atual</p>
                  <p className="text-2xl text-gray-900">{currentSet}</p>
                  <p className="text-sm text-gray-600">de {currentExercise.sets || 1}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Repetições</p>
                  <p className="text-2xl text-gray-900">{currentExercise.reps || '---'}</p>
                  <p className="text-sm text-gray-600">repetições</p>
                </div>
              </div>
            </div>

            {/* Rest Timer */}
            {isResting && (
              <div className="text-center mb-6">
                <div className="w-32 h-32 mx-auto relative">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - timeRemaining / currentExercise.restTime)}`}
                      className="text-blue-500 transition-all duration-1000"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl text-gray-900">{formatTimer(timeRemaining)}</p>
                      <p className="text-sm text-gray-600">Descanso</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {!isResting ? (
                <Button
                  onClick={startRest}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Completar Série
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={togglePause}
                    variant="outline"
                    className="h-12"
                  >
                    {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  </Button>
                  <Button
                    onClick={nextSet}
                    className="h-12 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                  >
                    {timeRemaining === 0 ? 'Próxima Série' : 'Pular Descanso'}
                  </Button>
                </div>
              )}

              <Button
                onClick={skipExercise}
                variant="outline"
                className="w-full h-12"
              >
                <SkipForward className="w-5 h-5 mr-2" />
                Pular Exercício
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Next Exercise Preview */}
        {currentExerciseIndex < totalExercises - 1 && (
          <Card className="border-0 bg-blue-50">
            <CardContent className="p-4">
              <h3 className="text-sm text-blue-700 mb-1">Próximo Exercício</h3>
              <p className="text-blue-900">{workout.exercises[currentExerciseIndex + 1].name}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}