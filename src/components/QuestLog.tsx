'use client';

import { useState, useEffect } from 'react';
import { Quest, QuestStatus, loadQuests, deleteQuest, updateQuest } from '@/data/quests';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import QuestForm from './QuestForm';

export default function QuestLog() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [activeTab, setActiveTab] = useState<QuestStatus>('available');
  const [showForm, setShowForm] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [expandedQuest, setExpandedQuest] = useState<string | null>(null);

  useEffect(() => {
    setQuests(loadQuests());
  }, []);

  const tabs: { status: QuestStatus; label: string; color: string }[] = [
    { status: 'available', label: 'Available', color: 'text-cyan-400 border-cyan-400' },
    { status: 'in-progress', label: 'In Progress', color: 'text-yellow-400 border-yellow-400' },
    { status: 'completed', label: 'Completed', color: 'text-emerald-400 border-emerald-400' },
    { status: 'failed', label: 'Failed', color: 'text-red-400 border-red-400' }
  ];

  const filteredQuests = quests.filter(quest => quest.status === activeTab);

  const handleAddQuest = () => {
    setEditingQuest(null);
    setShowForm(true);
  };

  const handleEditQuest = (quest: Quest) => {
    setEditingQuest(quest);
    setShowForm(true);
  };

  const handleDeleteQuest = (questId: string) => {
    if (confirm('Are you sure you want to delete this quest?')) {
      deleteQuest(questId);
      setQuests(loadQuests());
    }
  };

  const handleFormSave = () => {
    setQuests(loadQuests());
    setShowForm(false);
    setEditingQuest(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingQuest(null);
  };

  const toggleQuestExpansion = (questId: string) => {
    setExpandedQuest(expandedQuest === questId ? null : questId);
  };

  const toggleObjective = (questId: string, objectiveId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    const updatedObjectives = quest.objectives.map(obj => 
      obj.id === objectiveId ? { ...obj, completed: !obj.completed } : obj
    );

    updateQuest(questId, { objectives: updatedObjectives });
    setQuests(loadQuests());
  };

  const getStatusIcon = (status: QuestStatus) => {
    switch (status) {
      case 'completed':
        return <CheckIcon className="h-5 w-5 text-emerald-400" />;
      case 'failed':
        return <XMarkIcon className="h-5 w-5 text-red-400" />;
      default:
        return null;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Quest Log
            </h1>
            <p className="text-slate-400 mt-2">Track your adventures and objectives</p>
          </div>
          <button
            onClick={handleAddQuest}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors font-medium"
          >
            <PlusIcon className="h-5 w-5" />
            New Quest
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          {tabs.map((tab) => {
            const count = quests.filter(q => q.status === tab.status).length;
            const isActive = activeTab === tab.status;
            
            return (
              <button
                key={tab.status}
                onClick={() => setActiveTab(tab.status)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  isActive 
                    ? `bg-slate-700/50 ${tab.color} border-b-2` 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                }`}
              >
                {tab.label}
                <span className={`px-2 py-1 rounded-full text-xs ${
                  isActive ? 'bg-slate-600' : 'bg-slate-800'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quest List */}
        <div className="space-y-4">
          {filteredQuests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📜</div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">
                No {activeTab.replace('-', ' ')} quests
              </h3>
              <p className="text-slate-400 mb-6">
                {activeTab === 'available' ? 'Create your first quest to get started!' : `No ${activeTab} quests found.`}
              </p>
              {activeTab === 'available' && (
                <button
                  onClick={handleAddQuest}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors font-medium"
                >
                  Create Quest
                </button>
              )}
            </div>
          ) : (
            filteredQuests.map((quest) => (
              <div
                key={quest.id}
                className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl overflow-hidden"
              >
                {/* Quest Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => toggleQuestExpansion(quest.id)}>
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(quest.status)}
                        <h3 className="text-xl font-semibold text-white">{quest.title}</h3>
                        <span className="text-sm text-slate-400">
                          by {quest.questGiver}
                        </span>
                      </div>
                      <p className="text-slate-300 line-clamp-2">{quest.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
                        <span>
                          {quest.objectives.filter(obj => obj.completed).length}/{quest.objectives.length} objectives
                        </span>
                        <span>•</span>
                        <span>
                          Created {formatDate(quest.dateCreated)}
                        </span>
                        {quest.dateCompleted && (
                          <>
                            <span>•</span>
                            <span>
                              Completed {formatDate(quest.dateCompleted)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEditQuest(quest)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                        title="Edit Quest"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuest(quest.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                        title="Delete Quest"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedQuest === quest.id && (
                  <div className="border-t border-slate-700 p-6 bg-slate-800/50">
                    {/* Objectives */}
                    {quest.objectives.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-white mb-3">Objectives</h4>
                        <div className="space-y-2">
                          {quest.objectives.map((objective) => (
                            <div key={objective.id} className="flex items-center gap-3">
                              <button
                                onClick={() => toggleObjective(quest.id, objective.id)}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors hover:scale-110 ${
                                  objective.completed 
                                    ? 'bg-emerald-600 border-emerald-600 hover:bg-emerald-700' 
                                    : 'border-slate-400 hover:border-emerald-400 hover:bg-emerald-400/10'
                                }`}
                              >
                                {objective.completed && (
                                  <CheckIcon className="h-3 w-3 text-white" />
                                )}
                              </button>
                              <span className={`${
                                objective.completed 
                                  ? 'text-slate-400 line-through' 
                                  : 'text-slate-200'
                              }`}>
                                {objective.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rewards */}
                    {quest.rewards.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-white mb-3">Rewards</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {quest.rewards.map((reward) => (
                            <div key={reward.id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                              <span className="text-2xl">
                                {reward.type === 'magic-item' ? '✨' :
                                 reward.type === 'potion' ? '🧪' :
                                 reward.type === 'gold' ? '💰' :
                                 reward.type === 'ingredient' ? '🌿' : '📦'}
                              </span>
                              <div className="flex-1">
                                <div className="text-white font-medium">
                                  {reward.name}
                                  {reward.quantity && reward.quantity > 1 && (
                                    <span className="text-slate-400 ml-1">×{reward.quantity}</span>
                                  )}
                                </div>
                                {reward.description && (
                                  <div className="text-sm text-slate-400">{reward.description}</div>
                                )}
                                {reward.value && (
                                  <div className="text-sm text-emerald-400">{reward.value} gp</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {quest.notes && (
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Notes</h4>
                        <div className="p-4 bg-slate-700/50 rounded-lg text-slate-200 whitespace-pre-wrap">
                          {quest.notes}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quest Form Modal */}
      {showForm && (
        <QuestForm
          quest={editingQuest}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
          isEditing={!!editingQuest}
        />
      )}
    </div>
  );
}