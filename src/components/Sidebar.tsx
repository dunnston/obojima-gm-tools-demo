'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BeakerIcon, 
  BookOpenIcon, 
  BuildingStorefrontIcon,
  CogIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  CircleStackIcon,
  BoltIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import LanguageSwitcher from './LanguageSwitcher';

export interface SidebarProps {
  onPageChange: (page: string) => void;
  currentPage: string;
}

export default function Sidebar({ onPageChange, currentPage }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useTranslation();

  const menuItems = [
    { id: 'potions', name: t('navigation.potions'), icon: BeakerIcon, color: 'text-emerald-400' },
    { id: 'foraging', name: t('navigation.ingredients'), icon: MagnifyingGlassIcon, color: 'text-green-400' },
    { id: 'vending', name: t('vendingMachine.title'), icon: BuildingStorefrontIcon, color: 'text-orange-400' },
    { id: 'encounters', name: t('navigation.encounters'), icon: SparklesIcon, color: 'text-purple-400' },
    { id: 'initiative', name: t('navigation.initiativeTracker'), icon: BoltIcon, color: 'text-yellow-400' },
    { id: 'characters', name: t('navigation.playerCharacters'), icon: UserIcon, color: 'text-cyan-400' },
    { id: 'notes', name: t('navigation.sessionPlanner'), icon: BookOpenIcon, color: 'text-blue-400' },
    { id: 'calendar', name: t('navigation.obojimaCalendar'), icon: CalendarDaysIcon, color: 'text-sky-400' },
    { id: 'downtime', name: t('navigation.downtimeTracker'), icon: CalendarDaysIcon, color: 'text-violet-400' },
    { id: 'quests', name: t('navigation.questLog'), icon: DocumentTextIcon, color: 'text-rose-400' },
    { id: 'database', name: t('navigation.databaseEditor'), icon: CircleStackIcon, color: 'text-amber-400' },
    { id: 'settings', name: t('navigation.settings'), icon: CogIcon, color: 'text-gray-400' },
    { id: 'credits', name: t('navigation.credits'), icon: InformationCircleIcon, color: 'text-indigo-400' }
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 transition-all duration-200"
        >
          {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed md:static h-screen md:h-auto z-40 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isOpen ? 'w-64' : 'md:w-16'}
      `}>
        {/* Backdrop for mobile */}
        {isOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            onClick={() => setIsOpen(false)}
          />
        )}

        <div className="relative h-full bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-r border-white/10 shadow-2xl z-40">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className={`flex items-center gap-3 ${!isOpen && 'md:justify-center'}`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg">
                <BeakerIcon className="h-6 w-6 text-white" />
              </div>
              {isOpen && (
                <div>
                  <h1 className="text-xl font-bold text-white">Obojima</h1>
                  <p className="text-sm text-slate-400">Game Master Tools</p>
                </div>
              )}
            </div>
          </div>

          {/* Language Switcher */}
          {isOpen && (
            <div className="px-6 py-3 border-b border-white/10">
              <LanguageSwitcher />
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-white/20 to-white/10 border border-white/20 shadow-lg' 
                      : 'hover:bg-white/10 border border-transparent'
                    }
                    ${!isOpen && 'md:justify-center md:px-2'}
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : item.color}`} />
                  {isOpen && (
                    <span className={`font-medium ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {item.name}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Add new section button */}
          <div className="p-4 border-t border-white/10">
            <button className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-white/20 
              text-slate-400 hover:text-white hover:border-white/40 transition-all duration-200
              ${!isOpen && 'md:justify-center md:px-2'}
            `}>
              <PlusIcon className="h-5 w-5" />
              {isOpen && <span className="font-medium">{t('buttons.addNew')}</span>}
            </button>
          </div>

          {/* Collapse button for desktop */}
          <div className="hidden md:block p-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-center py-2 text-slate-400 hover:text-white transition-colors duration-200"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}