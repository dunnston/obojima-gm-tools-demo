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
import EnhancedObojimaCalendar from '@/components/EnhancedObojimaCalendar';
import LocalSetupPage from './local-setup/page';
import { syncService } from '@/services/sync';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('potions');
  
  // Add Obojima calendar state here - this will be passed to both calendar and downtime tracker
  const [currentObojimaDate, setCurrentObojimaDate] = useState({ year: 1, season: 'Spring', phase: 'New Moon', day: 1, cycle: 1 });
  const [calendarSyncStatus, setCalendarSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  // Load saved date from settings with sync after component mounts
  useEffect(() => {
    loadCalendarDate();
    
    // Set up automatic sync every 30 minutes (1800000 ms)
    const syncInterval = setInterval(() => {
      loadCalendarDate();
    }, 30 * 60 * 1000); // 30 minutes
    
    // Cleanup interval on component unmount
    return () => clearInterval(syncInterval);
  }, []);

  const loadCalendarDate = async () => {
    setCalendarSyncStatus('syncing');
    try {
      const result = await syncService.getSettings();
      if (result.success && result.data && result.data.currentObojimaDate) {
        const savedDate = result.data.currentObojimaDate;
        // Ensure all properties exist for backward compatibility
        const dateWithDefaults = {
          year: savedDate.year || 1,
          season: savedDate.season || 'Spring',
          phase: savedDate.phase || 'New Moon',
          day: savedDate.day || 1,
          cycle: savedDate.cycle || 1
        };
        setCurrentObojimaDate(dateWithDefaults);
        setCalendarSyncStatus('idle');
      } else {
        // Fall back to localStorage for migration
        const saved = localStorage.getItem('obojima-current-date');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            // Ensure cycle property exists for backward compatibility
            if (!parsed.cycle) {
              parsed.cycle = 1;
            }
            setCurrentObojimaDate(parsed);
            // Migrate to sync
            await syncService.saveSetting('currentObojimaDate', parsed);
            setCalendarSyncStatus('idle');
          } catch {
            // Keep default value
            setCalendarSyncStatus('error');
          }
        } else {
          setCalendarSyncStatus('idle');
        }
      }
    } catch (error) {
      console.error('Error loading calendar date:', error);
      setCalendarSyncStatus('error');
      // Fall back to localStorage
      const saved = localStorage.getItem('obojima-current-date');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (!parsed.cycle) {
            parsed.cycle = 1;
          }
          setCurrentObojimaDate(parsed);
        } catch {
          // Keep default value
        }
      }
    }
  };

  // Save Obojima date to settings with sync when it changes
  const handleObojimaDateChange = async (newDate: any, skipEventIds?: string[]) => {
    setCurrentObojimaDate(newDate);
    
    try {
      const result = await syncService.saveSetting('currentObojimaDate', {
        year: newDate.year,
        season: newDate.season,
        phase: newDate.phase,
        day: newDate.day,
        cycle: newDate.cycle
      });
      
      if (!result.success) {
        console.warn('Calendar date saved locally but sync failed');
      }
    } catch (error) {
      console.error('Error syncing calendar date:', error);
    }
    
    // Always save to localStorage as backup
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
        return <SessionPlanner onPageChange={setCurrentPage} currentGameDate={currentObojimaDate} onGameDateChange={handleObojimaDateChange} />;
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
        return <EnhancedObojimaCalendar currentDate={currentObojimaDate} onDateChange={handleObojimaDateChange} onRefresh={loadCalendarDate} syncStatus={calendarSyncStatus} />;
      case 'downtime':
        return <DowntimeTracker currentObojimaDate={currentObojimaDate} />;
      case 'local-setup':
        return <LocalSetupPage />;
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

      <div className="grid grid-cols-[auto_1fr] min-h-screen">
        <Sidebar onPageChange={setCurrentPage} currentPage={currentPage} />
        <div className="min-h-screen">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}