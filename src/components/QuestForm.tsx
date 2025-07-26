'use client';

import { useState } from 'react';
import { Quest, QuestFormData, QuestReward, createEmptyQuest, formDataToQuest, addQuest, updateQuest, QUEST_REWARD_TYPES, QuestStatus } from '@/data/quests';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import QuestRewardSelector from './QuestRewardSelector';

interface QuestFormProps {
  quest?: Quest | null;
  onSave: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function QuestForm({ quest, onSave, onCancel, isEditing = false }: QuestFormProps) {
  const [formData, setFormData] = useState<QuestFormData>(() => {
    if (quest) {
      return {
        title: quest.title,
        questGiver: quest.questGiver,
        description: quest.description,
        status: quest.status,
        objectives: quest.objectives.map(obj => obj.description),
        rewards: quest.rewards.map(reward => ({
          type: reward.type,
          name: reward.name,
          description: reward.description,
          quantity: reward.quantity,
          value: reward.value
        })),
        notes: quest.notes || ''
      };
    }
    return createEmptyQuest();
  });

  const handleInputChange = (field: keyof QuestFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    setFormData(prev => ({ ...prev, objectives: newObjectives }));
  };

  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const removeObjective = (index: number) => {
    if (formData.objectives.length > 1) {
      const newObjectives = formData.objectives.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, objectives: newObjectives }));
    }
  };

  const handleRewardChange = (index: number, field: keyof Omit<QuestReward, 'id'> | 'all', value: any) => {
    const newRewards = [...formData.rewards];
    if (field === 'all') {
      newRewards[index] = value;
    } else {
      newRewards[index] = { ...newRewards[index], [field]: value };
    }
    setFormData(prev => ({ ...prev, rewards: newRewards }));
  };

  const addReward = () => {
    setFormData(prev => ({
      ...prev,
      rewards: [...prev.rewards, {
        type: 'other',
        name: '',
        description: '',
        quantity: 1,
        value: undefined
      }]
    }));
  };

  const removeReward = (index: number) => {
    const newRewards = formData.rewards.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, rewards: newRewards }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.questGiver.trim()) {
      alert('Quest title and quest giver are required');
      return;
    }

    const questData = formDataToQuest(formData);

    if (isEditing && quest) {
      updateQuest(quest.id, questData);
    } else {
      addQuest(questData);
    }

    onSave();
  };

  const statusOptions: { value: QuestStatus; label: string }[] = [
    { value: 'available', label: 'Available' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            {isEditing ? 'Edit Quest' : 'Create New Quest'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Quest Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                placeholder="Enter quest title..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Quest Giver *
              </label>
              <input
                type="text"
                value={formData.questGiver}
                onChange={(e) => handleInputChange('questGiver', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                placeholder="Who gives this quest?"
                required
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as QuestStatus)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
              placeholder="Describe the quest..."
            />
          </div>

          {/* Objectives */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-300">
                Objectives
              </label>
              <button
                type="button"
                onClick={addObjective}
                className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                Add Objective
              </button>
            </div>
            <div className="space-y-3">
              {formData.objectives.map((objective, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => handleObjectiveChange(index, e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                      placeholder={`Objective ${index + 1}...`}
                    />
                  </div>
                  {formData.objectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeObjective(index)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700/50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Rewards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-300">
                Rewards
              </label>
              <button
                type="button"
                onClick={addReward}
                className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                Add Reward
              </button>
            </div>
            <div className="space-y-4">
              {formData.rewards.map((reward, index) => (
                <QuestRewardSelector
                  key={index}
                  reward={reward}
                  onChange={(updatedReward) => handleRewardChange(index, 'all', updatedReward)}
                  onRemove={() => removeReward(index)}
                />
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
              placeholder="Additional notes about this quest..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              {isEditing ? 'Update Quest' : 'Create Quest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}