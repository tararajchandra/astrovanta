import React from 'react';
import { useAvailability } from '../../hooks/useSupabase';
import { Clock } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function AvailabilitySettings() {
  const { data: availabilities, isLoading } = useAvailability();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5" /> Weekly Availability
      </h2>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-gray-500">Loading availability...</div>
        ) : (
          DAYS.map((day, index) => {
            const avail = availabilities?.find(a => a.day_of_week === index);
            const isAvail = avail?.is_available ?? false;
            
            return (
              <div key={index} className="flex items-center justify-between border-b border-gray-50 pb-3">
                <div className="flex items-center gap-4 w-32">
                  <input type="checkbox" checked={isAvail} readOnly className="rounded text-indigo-600 focus:ring-indigo-500" />
                  <span className={`font-medium ${isAvail ? 'text-gray-900' : 'text-gray-400'}`}>{day}</span>
                </div>
                {isAvail ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="time" defaultValue={avail.start_time} className="border rounded px-2 py-1" />
                    <span>to</span>
                    <input type="time" defaultValue={avail.end_time} className="border rounded px-2 py-1" />
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 italic">Unavailable</div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
