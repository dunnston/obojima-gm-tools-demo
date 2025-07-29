'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import PotionBrewing from '@/components/PotionBrewing';
import VendingMachine from '@/components/VendingMachine';
import EncounterCreator from '@/components/EncounterCreator';
import IngredientForaging from '@/components/IngredientForaging';
import CharacterManager from '@/components/CharacterManager';
import SessionPlanner from '@/components/SessionPlanner';
import DatabaseView from '@/components/DatabaseView';
import Settings from '@/components/Settings';
import InitiativeTracker from '@/components/InitiativeTracker';
import QuestLog from '@/components/QuestLog';
import Credits from '@/components/Credits';
import DowntimeTracker from '@/components/DowntimeTracker';
import ObojimaCalendar from '@/components/ObojimaCalendar';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('potions');
  
  // Add Obojima calendar state here - this will be passed to both calendar and downtime tracker
  const [currentObojimaDate, setCurrentObojimaDate] = useState({ year: 1, season: 'Spring', phase: 'New Moon', day: 1, cycle: 1 });

  // Load saved date from localStorage after component mounts
  useEffect(() => {
    const saved = localStorage.getItem('obojima-current-date');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure cycle property exists for backward compatibility
        if (!parsed.cycle) {
          parsed.cycle = 1;
        }
        setCurrentObojimaDate(parsed);
      } catch {
        // Keep default value
      }
    }
  }, []);

  // Save Obojima date to localStorage when it changes
  const handleObojimaDateChange = (newDate: any) => {
    setCurrentObojimaDate(newDate);
    localStorage.setItem('obojima-current-date', JSON.stringify(newDate));
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'potions':
        return <PotionBrewing />;
      case 'foraging':
        return <IngredientForaging />;
      case 'characters':
        return <CharacterManager />;
      case 'notes':
        return <SessionPlanner onPageChange={setCurrentPage} />;
      case 'quests':
        return <QuestLog />;
      case 'encounters':
        return <EncounterCreator />;
      case 'vending':
        return <VendingMachine />;
      case 'database':
        return <DatabaseView />;
      case 'initiative':
        return <InitiativeTracker />;
      case 'calendar':
        return <ObojimaCalendar currentDate={currentObojimaDate} onDateChange={handleObojimaDateChange} />;
      case 'downtime':
        return <DowntimeTracker currentObojimaDate={currentObojimaDate} />;
      case 'settings':
        return <Settings />;
      case 'credits':
        return <Credits />;
      default:
        return <PotionBrewing />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="flex h-screen relative">
        <Sidebar onPageChange={setCurrentPage} currentPage={currentPage} />
        <div className="flex-1 overflow-auto">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}