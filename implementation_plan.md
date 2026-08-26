# AstroVanta - Implementation Plan

## Phase 3 Verification
- **Astrology Engine**: Verified that `services/astrology-engine` already implements the Python Swiss Ephemeris wrapper with API routes for Kundli, Dasha, and Transit.
- **Offline Engine**: Verified that `apps/desktop/src/lib/astroEngine.ts` contains the offline-fallback Meeus algorithm implementation.
- **UI**: Verified that `KundliPage.tsx` is already present.
*(Phase 3 is considered complete)*

---

# Phase 4: Consultation & Reports

This document outlines the design and implementation plan for Phase 4 of AstroVanta, focusing on Consultations, Notes, and PDF Reports generation.

## User Review Required

> [!IMPORTANT]  
> Please review this Phase 4 implementation plan. Once approved, I will proceed with creating the necessary database modifications and React components.

## 1. Frontend Architecture (React + Vite)

### Consultation Management
- **Consultation Tab**: Inside the Client Details page, add a tab to list historical consultations.
- **Consultation Workflow**:
  1. Select an appointment.
  2. Add `private_notes` (strictly visible only to the astrologer).
  3. Add `client_visible_notes` and `recommendations` (remedies, gemstones, mantras).
  4. Save to Supabase `consultations` table.

### Professional Report Engine
- **Report Settings**: A settings page where the astrologer can upload their logo and define default headers/footers for reports.
- **PDF Generation**: We will use a robust client-side PDF generation library such as `pdfmake` or `@react-pdf/renderer` so that the desktop app can generate reports offline, and the web app can generate them instantly without server roundtrips.
- **Report Template**: 
  - Cover Page (Logo, Astrologer Name, Client Name)
  - Birth Details & Basic Kundli
  - Divisional Charts (D9 Navamsa)
  - Current Dasha & Recommendations

## Proposed Changes

No files will be modified until you approve this plan. Upon approval, I will:

### Frontend (`apps/web` and `apps/desktop`)
#### [MODIFY] `package.json` (Add `@react-pdf/renderer`)
#### [NEW] `src/pages/crm/ConsultationTab.tsx`
#### [NEW] `src/components/pdf/ReportDocument.tsx`
#### [NEW] `src/pages/settings/ReportSettings.tsx`

## Verification Plan
- Ensure a consultation can be successfully saved with private notes.
- Ensure the PDF engine can successfully generate a report containing the Kundli and branding.
