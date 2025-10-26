import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Play, Clock, Repeat, Timer, Dumbbell } from 'lucide-react';

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

interface WorkoutDetailProps {
  workout: Workout;
  onStartWorkout: () => void;
  onBack: () => void;
}

export function WorkoutDetail({ workout, onStartWorkout, onBack }: WorkoutDetailProps) {
  const formatRestTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const totalExercises = workout.exercises.length;
  const estimatedTime = workout.duration;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl text-gray-900">{workout.name}</h1>
            <p className="text-sm text-gray-600">Detalhes do Treino</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Workout Overview */}
        <Card className="border-0 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-2xl text-gray-900">{estimatedTime}</p>
                <p className="text-sm text-gray-600">Minutos</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Dumbbell className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-2xl text-gray-900">{totalExercises}</p>
                <p className="text-sm text-gray-600">Exercícios</p>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm text-gray-700 mb-2">Músculos Alvo</h3>
              <div className="flex flex-wrap gap-2">
                {workout.musclesTargeted.map((muscle) => (
                  <Badge key={muscle} variant="secondary" className="bg-blue-100 text-blue-700">
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              onClick={onStartWorkout}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              <Play className="w-5 h-5 mr-2" />
              Iniciar Treino
            </Button>
          </CardContent>
        </Card>

        {/* Exercise List */}
        <div>
          <h2 className="text-lg text-gray-900 mb-3">Exercises ({totalExercises})</h2>
          <div className="space-y-3">
            {workout.exercises.map((exercise, index) => (
              <Card key={exercise.id} className="border-0 bg-white shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg text-gray-900 mb-1">{exercise.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{exercise.machineName}</p>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Muscle</p>
                          <p className="text-gray-900">{exercise.primaryMuscle}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Sets & Reps</p>
                          <p className="text-gray-900">
                            {exercise.sets && exercise.reps 
                              ? `${exercise.sets} × ${exercise.reps}`
                              : exercise.duration 
                                ? `${exercise.duration}s`
                                : 'N/A'
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Rest</p>
                          <p className="text-gray-900">{formatRestTime(exercise.restTime)}</p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <Badge variant="outline" className="text-xs">
                          {exercise.primaryMuscle}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="pt-4">
          <Card className="border-0 bg-gradient-to-r from-blue-500 to-green-500 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg mb-2">Ready to get started?</h3>
              <p className="text-blue-100 text-sm mb-4">
                Tap "Start Workout" to begin your training session with guided timers and progress tracking.
              </p>
              <Button
                onClick={onStartWorkout}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Workout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}