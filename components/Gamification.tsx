import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ArrowLeft, Flame, Trophy, Target, Calendar, Award, Star, Zap } from 'lucide-react';
import * as api from '../utils/api';

interface GamificationProps {
  onBack: () => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  points: number;
  progress?: number;
}

interface GamificationData {
  streakCount: number;
  weeklyWorkouts: number;
  monthlyWorkouts: number;
  totalPoints: number;
  workoutsCompleted: number;
  currentRank: string;
  nextRank: string;
  nextRankProgress: number;
  achievements: Achievement[];
  weeklyGoal: number;
  monthlyGoal: number;
}

const iconMap: Record<string, any> = {
  Target,
  Calendar,
  Flame,
  Trophy,
  Star,
  Award
};

export function Gamification({ onBack }: GamificationProps) {
  const [data, setData] = useState<GamificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      setIsLoading(true);
      const gamificationData = await api.getGamificationData();
      setData(gamificationData);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setIsLoading(false);
    }
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

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Erro ao carregar dados de gamificação</p>
            <Button onClick={onBack} className="mt-4">
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    streakCount,
    weeklyWorkouts,
    monthlyWorkouts,
    totalPoints,
    currentRank,
    nextRank,
    nextRankProgress,
    achievements,
    weeklyGoal,
    monthlyGoal
  } = data;

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
          <div>
            <h1 className="text-xl text-gray-900">Progresso e Recompensas</h1>
            <p className="text-sm text-gray-600">Acompanhe sua jornada fitness</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          {/* Streak Card */}
          <Card className="border-0 bg-gradient-to-br from-orange-400 to-red-500 text-white">
            <CardContent className="p-4 text-center">
              <Flame className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{streakCount}</p>
              <p className="text-sm text-orange-100">Sequência de Dias</p>
            </CardContent>
          </Card>

          {/* Points Card */}
          <Card className="border-0 bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{totalPoints}</p>
              <p className="text-sm text-yellow-100">Pontos Totais</p>
            </CardContent>
          </Card>
        </div>

        {/* Current Rank */}
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>Rank Atual: {currentRank}</span>
            </CardTitle>
            <CardDescription>
              {100 - nextRankProgress}% para o rank {nextRank}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={nextRankProgress} className="h-3 mb-2" />
            <p className="text-sm text-gray-600">
              Continue treinando para alcançar {nextRank}!
            </p>
          </CardContent>
        </Card>

        {/* Weekly & Monthly Goals */}
        <div className="space-y-4">
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-500" />
                <span>Meta Semanal</span>
              </CardTitle>
              <CardDescription>
                {weeklyWorkouts} de {weeklyGoal} treinos completados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={(weeklyWorkouts / weeklyGoal) * 100} className="h-3 mb-2" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{weeklyWorkouts} completados</span>
                <span>{Math.max(0, weeklyGoal - weeklyWorkouts)} restantes</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-green-500" />
                <span>Meta Mensal</span>
              </CardTitle>
              <CardDescription>
                {monthlyWorkouts} de {monthlyGoal} treinos completados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={(monthlyWorkouts / monthlyGoal) * 100} className="h-3 mb-2" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{monthlyWorkouts} completados</span>
                <span>{Math.max(0, monthlyGoal - monthlyWorkouts)} restantes</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-lg text-gray-900 mb-3">Conquistas</h2>
          <div className="space-y-3">
            {achievements.map((achievement) => {
              const Icon = iconMap[achievement.icon] || Target;
              return (
                <Card 
                  key={achievement.id} 
                  className={`border-0 shadow-sm ${
                    achievement.earned 
                      ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200' 
                      : 'bg-white'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        achievement.earned 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-gray-900">{achievement.title}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={achievement.earned ? "default" : "secondary"}
                              className={achievement.earned ? "bg-green-500" : ""}
                            >
                              {achievement.points} pts
                            </Badge>
                            {achievement.earned && (
                              <Badge variant="outline" className="border-green-500 text-green-700">
                                Conquistada
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                        
                        {!achievement.earned && achievement.progress !== undefined && (
                          <div>
                            <Progress value={achievement.progress} className="h-2 mb-1" />
                            <p className="text-xs text-gray-500">{Math.round(achievement.progress)}% completo</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Motivational Section */}
        <Card className="border-0 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
          <CardContent className="p-6 text-center">
            <Zap className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg mb-2">Continue Assim!</h3>
            <p className="text-purple-100 text-sm mb-4">
              Você está indo muito bem! Complete {Math.max(0, weeklyGoal - weeklyWorkouts)} treinos esta semana para alcançar sua meta.
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-2xl font-bold">{streakCount}</p>
                <p className="text-purple-200">Sequência</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{weeklyWorkouts}</p>
                <p className="text-purple-200">Esta Semana</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{monthlyWorkouts}</p>
                <p className="text-purple-200">Este Mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
