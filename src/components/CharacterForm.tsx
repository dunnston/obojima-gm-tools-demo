'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PlayerCharacter, CharacterFormData, DND_CLASSES, createEmptyCharacter, formDataToCharacter } from '@/data/characters';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { syncService } from '@/services/sync';
import { isTauriEnvironment } from '@/lib/storage';

interface CharacterFormProps {
  character?: PlayerCharacter;
  onSave: (character: Omit<PlayerCharacter, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function CharacterForm({ character, onSave, onCancel, isEditing = false }: CharacterFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CharacterFormData>(() => {
    if (character) {
      return {
        characterName: character.characterName,
        playerName: character.playerName,
        class: character.class,
        level: character.level || 1,
        armorClass: character.armorClass,
        hitPoints: character.hitPoints || 0,
        maxHitPoints: character.maxHitPoints || 0,
        passivePerception: character.passivePerception,
        passiveInsight: character.passiveInsight,
        passiveInvestigation: character.passiveInvestigation,
        strength: character.strength || 10,
        dexterity: character.dexterity || 10,
        constitution: character.constitution || 10,
        intelligence: character.intelligence || 10,
        wisdom: character.wisdom || 10,
        charisma: character.charisma || 10,
        speed: character.speed || 30,
        proficiencyBonus: character.proficiencyBonus || 2,
        characterGoal: character.characterGoal,
        boons: character.boons.join('\n'),
        personalityTraits: character.personalityTraits.join('\n'),
        ideals: character.ideals.join('\n'),
        bonds: character.bonds.join('\n'),
        flaws: character.flaws.join('\n'),
        notes: character.notes || '',
        imageUrl: character.imageUrl || ''
      };
    }
    return createEmptyCharacter();
  });

  const handleInputChange = (field: keyof CharacterFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.characterName.trim() || !formData.playerName.trim()) {
      alert(t('characters.form.namesRequired'));
      return;
    }

    let updatedFormData = { ...formData };

    // Handle file upload if a file is selected
    if (selectedFile) {
      try {
        const fileExtension = selectedFile.name.split('.').pop();
        const filename = `${formData.characterName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${fileExtension}`;

        const result = await syncService.uploadFile(selectedFile, 'characters', filename);

        if (!result.success) {
          throw new Error(result.error || 'Upload failed');
        }

        // In Tauri mode, use the data URL directly for display
        // In web mode, use the file path
        if (isTauriEnvironment() && result.data?.dataUrl) {
          updatedFormData.imageUrl = result.data.dataUrl;
        } else {
          updatedFormData.imageUrl = result.data?.path || `/images/characters/${filename}`;
        }

        console.log('Character portrait saved as:', filename);

      } catch (error) {
        console.error('Error handling file upload:', error);
        alert(t('characters.form.uploadError'));
        return;
      }
    }

    const characterData = formDataToCharacter(updatedFormData);
    onSave(characterData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            {isEditing ? t('characters.form.editCharacter') : t('characters.form.addNewCharacter')}
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
                {t('characters.form.characterName')} *
              </label>
              <input
                type="text"
                value={formData.characterName}
                onChange={(e) => handleInputChange('characterName', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                placeholder={t('characters.form.characterNamePlaceholder')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('characters.form.playerName')} *
              </label>
              <input
                type="text"
                value={formData.playerName}
                onChange={(e) => handleInputChange('playerName', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                placeholder={t('characters.form.playerNamePlaceholder')}
                required
              />
            </div>
          </div>

          {/* Class and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('characters.class')}
              </label>
              <select
                value={formData.class}
                onChange={(e) => handleInputChange('class', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="">{t('characters.form.selectClass')}</option>
                {DND_CLASSES.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('characters.level')}
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                placeholder={t('characters.level')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('characters.armorClass')}
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.armorClass}
                onChange={(e) => handleInputChange('armorClass', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                placeholder={t('characters.form.ac')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('characters.form.currentHitPoints')}
              </label>
              <input
                type="number"
                min="0"
                max="999"
                value={formData.hitPoints}
                onChange={(e) => handleInputChange('hitPoints', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                placeholder={t('characters.form.currentHp')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('characters.form.maxHitPoints')}
              </label>
              <input
                type="number"
                min="1"
                max="999"
                value={formData.maxHitPoints}
                onChange={(e) => handleInputChange('maxHitPoints', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                placeholder={t('characters.form.maxHp')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('characters.passivePerception')}
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.passivePerception}
                onChange={(e) => handleInputChange('passivePerception', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                placeholder={t('characters.form.pp')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('characters.passiveInsight')}
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.passiveInsight}
                onChange={(e) => handleInputChange('passiveInsight', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                placeholder={t('characters.form.pi')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('characters.passiveInvestigation')}
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.passiveInvestigation}
                onChange={(e) => handleInputChange('passiveInvestigation', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                placeholder={t('characters.passiveInvestigation')}
              />
            </div>
          </div>

          {/* Ability Scores */}
          <div>
            <h3 className="text-lg font-semibold text-slate-300 mb-3 border-b border-slate-700 pb-2">{t('characters.form.abilityScores')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {([
                { key: 'strength' as const, label: 'STR' },
                { key: 'dexterity' as const, label: 'DEX' },
                { key: 'constitution' as const, label: 'CON' },
                { key: 'intelligence' as const, label: 'INT' },
                { key: 'wisdom' as const, label: 'WIS' },
                { key: 'charisma' as const, label: 'CHA' },
              ]).map(({ key, label }) => {
                const val = typeof formData[key] === 'string' ? parseInt(formData[key] as string) || 10 : (formData[key] as number);
                const mod = Math.floor((val - 10) / 2);
                const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                return (
                  <div key={key} className="text-center">
                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">{label}</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData[key]}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      className="w-full px-2 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-center font-bold focus:outline-none focus:border-emerald-400"
                    />
                    <div className={`text-xs mt-1 font-medium ${mod > 0 ? 'text-emerald-400' : mod < 0 ? 'text-red-400' : 'text-slate-400'}`}>{modStr}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Speed & Proficiency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('characters.form.speed')}
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={formData.speed}
                onChange={(e) => handleInputChange('speed', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                placeholder="30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('characters.form.proficiency')}
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.proficiencyBonus}
                onChange={(e) => handleInputChange('proficiencyBonus', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                placeholder="+2"
              />
              <p className="text-xs text-slate-500 mt-1">{t('characters.form.proficiencyHint')}</p>
            </div>
          </div>

          <div>
            {/* Character Portrait Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('characters.form.characterPortrait')}
              </label>
              
              {/* Drag and Drop Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="portrait-upload"
                />
                <label htmlFor="portrait-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    <div className="text-4xl">🖼️</div>
                    <div className="text-sm text-slate-300">
                      {t('characters.form.dragDropPortrait')} <span className="text-emerald-400">{t('characters.form.clickToBrowse')}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {t('characters.form.supportedFormats')}
                    </div>
                  </div>
                </label>
              </div>

              {/* Selected File Info */}
              {selectedFile && (
                <div className="mt-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">
                      📁 {selectedFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl('');
                      }}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      {t('characters.form.remove')}
                    </button>
                  </div>
                </div>
              )}

              {/* Image Preview */}
              {previewUrl && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('characters.form.preview')}
                  </label>
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-slate-800">
                    <img 
                      src={previewUrl} 
                      alt="Character Portrait Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Show existing image if editing and no new file selected */}
              {!previewUrl && formData.imageUrl && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('characters.form.currentPortrait')}
                  </label>
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-slate-800">
                    <img 
                      src={formData.imageUrl} 
                      alt="Current Character Portrait"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Character Goal */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('characters.characterGoal')}
            </label>
            <textarea
              value={formData.characterGoal}
              onChange={(e) => handleInputChange('characterGoal', e.target.value)}
              rows={2}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
              placeholder={t('characters.form.characterGoalPlaceholder')}
            />
          </div>

          {/* Character Traits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('characters.boons')}
              </label>
              <textarea
                value={formData.boons}
                onChange={(e) => handleInputChange('boons', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
                placeholder={t('characters.form.boonsPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('characters.personalityTraits')}
              </label>
              <textarea
                value={formData.personalityTraits}
                onChange={(e) => handleInputChange('personalityTraits', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
                placeholder={t('characters.form.personalityTraitsPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('characters.ideals')}
              </label>
              <textarea
                value={formData.ideals}
                onChange={(e) => handleInputChange('ideals', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
                placeholder={t('characters.form.idealsPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('characters.bonds')}
              </label>
              <textarea
                value={formData.bonds}
                onChange={(e) => handleInputChange('bonds', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
                placeholder={t('characters.form.bondsPlaceholder')}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('characters.flaws')}
              </label>
              <textarea
                value={formData.flaws}
                onChange={(e) => handleInputChange('flaws', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
                placeholder={t('characters.form.flawsPlaceholder')}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('characters.additionalNotes')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 resize-none"
              placeholder={t('characters.form.notesPlaceholder')}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
{t('buttons.cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              {isEditing ? t('characters.form.updateCharacter') : t('characters.form.addCharacter')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}