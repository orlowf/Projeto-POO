import React from 'react';
import { Home, Trophy, Users, User } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: 'workouts' | 'gamification' | 'profile';
  onTabChange: (tab: 'workouts' | 'gamification' | 'profile') => void;
  userRole: 'student' | 'professor';
}

export function BottomNavigation({ activeTab, onTabChange, userRole }: BottomNavigationProps) {
  const tabs = [
    {
      id: 'workouts' as const,
      label: 'Home',
      icon: Home,
      available: true
    },
    {
      id: 'gamification' as const,
      label: 'Progresso',
      icon: Trophy,
      available: userRole === 'student'
    },
    {
      id: 'profile' as const,
      label: 'Perfil',
      icon: User,
      available: true
    }
  ].filter(tab => tab.available);

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}