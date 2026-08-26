import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAppointments } from '../../hooks/useSupabase';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export function CalendarPage() {
  const { data: appointments, isLoading } = useAppointments();

  const events = appointments?.map((apt: any) => ({
    id: apt.id,
    title: `${apt.customer?.first_name || 'Client'} - ${apt.type}`,
    start: new Date(apt.start_time),
    end: new Date(apt.end_time),
    resource: apt,
  })) || [];

  return (
    <div className="p-6 max-w-6xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarIcon className="w-6 h-6" /> Appointments
        </h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" /> Book Slot
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center h-full text-gray-500">Loading calendar...</div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            views={['month', 'week', 'day']}
            defaultView="week"
            eventPropGetter={(event) => {
              const status = event.resource.status;
              let backgroundColor = '#6366f1'; // indigo
              if (status === 'CONFIRMED') backgroundColor = '#10b981'; // green
              if (status === 'CANCELLED') backgroundColor = '#ef4444'; // red
              return { style: { backgroundColor, borderRadius: '8px' } };
            }}
          />
        )}
      </div>
    </div>
  );
}
