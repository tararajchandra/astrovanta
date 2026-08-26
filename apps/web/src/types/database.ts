export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: any; Insert: any; Update: any;
      }
      appointments: {
        Row: any; Insert: any; Update: any;
      }
      services: {
        Row: any; Insert: any; Update: any;
      }
      availability: {
        Row: any; Insert: any; Update: any;
      }
      consultations: {
        Row: any; Insert: any; Update: any;
      }
      chambers: {
        Row: any; Insert: any; Update: any;
      }
      chamber_available_dates: {
        Row: any; Insert: any; Update: any;
      }
      chamber_time_slots: {
        Row: any; Insert: any; Update: any;
      }
    }
  }
}
