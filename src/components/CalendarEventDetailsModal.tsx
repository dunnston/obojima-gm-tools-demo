'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarEvent, formatEventDate } from '@/data/calendarEvents';
import { 
  XMarkIcon, 
  PencilIcon,
  TrashIcon,
  CalendarDaysIcon,
  MapPinIcon,
  DocumentTextIcon,
  BookOpenIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface CalendarEventDetailsModalProps {
  event: CalendarEvent;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  onQuestClick?: (questId: string) => void;
}

export default function CalendarEventDetailsModal({
  event,
  onEdit,
  onDelete,
  onClose,
  onQuestClick
}: CalendarEventDetailsModalProps) {
  const { t } = useTranslation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${event.isDmOnly ? 'bg-amber-600/20' : 'bg-emerald-600/20'}`}>
              <CalendarDaysIcon className={`h-6 w-6 ${event.isDmOnly ? 'text-amber-400' : 'text-emerald-400'}`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                {event.title}
                {event.isDmOnly && (
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" title="DM Only Event" />
                )}
              </h2>
              <p className="text-slate-400">{formatEventDate(event)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Event Date */}
          <div className="flex items-start gap-3">
            <CalendarDaysIcon className="h-5 w-5 text-slate-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-slate-300">Event Date</h3>
              <p className="text-white">{formatEventDate(event)}</p>
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-3">
              <MapPinIcon className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-slate-300">Location</h3>
                <p className="text-white">{event.location}</p>
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="flex items-start gap-3">
              <DocumentTextIcon className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-slate-300">Description</h3>
                <p className="text-white whitespace-pre-wrap">{event.description}</p>
              </div>
            </div>
          )}

          {/* Linked Quest */}
          {event.questId && event.questTitle && (
            <div className="flex items-start gap-3">
              <BookOpenIcon className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-slate-300">Linked Quest</h3>
                {onQuestClick ? (
                  <button
                    onClick={() => onQuestClick(event.questId!)}
                    className="text-emerald-400 hover:text-emerald-300 underline"
                  >
                    {event.questTitle}
                  </button>
                ) : (
                  <p className="text-white">{event.questTitle}</p>
                )}
              </div>
            </div>
          )}

          {/* DM Only Flag */}
          {event.isDmOnly && (
            <div className="flex items-start gap-3 p-3 bg-amber-600/10 border border-amber-600/30 rounded-lg">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-amber-300">DM Only Event</h3>
                <p className="text-amber-200 text-sm">This event is only visible to the DM when the DM toggle is enabled.</p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-slate-700">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="text-slate-400">Created</h4>
                <p className="text-slate-300">{event.createdAt.toLocaleDateString()}</p>
              </div>
              <div>
                <h4 className="text-slate-400">Last Updated</h4>
                <p className="text-slate-300">{event.updatedAt.toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-slate-700">
            <button
              onClick={handleDelete}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showDeleteConfirm 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-600/20 hover:bg-red-600/30 text-red-400'
              }`}
            >
              <TrashIcon className="h-4 w-4" />
              {showDeleteConfirm ? 'Confirm Delete' : 'Delete Event'}
            </button>

            <div className="flex gap-3">
              {showDeleteConfirm && (
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
                Edit Event
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}