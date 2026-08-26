import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useAppointments() {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('start_time', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });
}

export function useAvailability() {
  return useQuery({
    queryKey: ['availability'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .order('day_of_week');
      if (error) throw error;
      return data;
    },
  });
}

// Phase 4 Hooks
export function useConsultations(appointmentId?: string) {
  return useQuery({
    queryKey: ['consultations', appointmentId],
    queryFn: async () => {
      let query = supabase.from('consultations').select('*, appointment:appointments(*)').order('created_at', { ascending: false });
      if (appointmentId) {
        query = query.eq('appointment_id', appointmentId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useAddConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newConsultation: any) => {
      const { data, error } = await supabase
        .from('consultations')
        .insert([newConsultation])
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
    },
  });
}

// ---- CHAMBERS (Customer Booking Portal) ----

export function useChambers() {
  return useQuery({
    queryKey: ['chambers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chambers')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

export function useChamberAvailableDates(chamberId: string) {
  return useQuery({
    queryKey: ['chamber_dates', chamberId],
    queryFn: async () => {
      if (!chamberId) return [];
      const { data, error } = await supabase
        .from('chamber_available_dates')
        .select('*')
        .eq('chamber_id', chamberId)
        .eq('is_blocked', false)
        .gte('available_date', new Date().toISOString().split('T')[0])
        .order('available_date');
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!chamberId,
  });
}

export function useChamberTimeSlots(chamberId: string) {
  return useQuery({
    queryKey: ['chamber_slots', chamberId],
    queryFn: async () => {
      if (!chamberId) return [];
      const { data, error } = await supabase
        .from('chamber_time_slots')
        .select('*')
        .eq('chamber_id', chamberId)
        .eq('is_active', true)
        .order('slot_time');
      if (error) throw error;
      return (data ?? []) as any[];
    },
    enabled: !!chamberId,
  });
}

