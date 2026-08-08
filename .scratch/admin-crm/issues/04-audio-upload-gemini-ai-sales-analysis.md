# 04 — Audio Recording Upload & Gemini AI Sales Coaching Analysis

**What to build:**
End-to-end sales audio recording analysis capability. Admins can open a lead's detail panel and upload audio files (`.mp3`, `.m4a`, `.wav`, `.webm`, `.ogg`). The backend accepts the upload via Multer, passes the audio stream to Google Gemini API (`GEMINI_API_KEY`), transcribes the conversation, and returns a structured AI Sales Analysis report containing a 1-10 selling score, key strengths, areas for improvement, objection handling suggestions, and recommended next steps. Results are saved to `admin_lead_recordings` table and displayed in an interactive AI Coaching Panel.

**Blocked by:** 03 — Create, Edit, & Delete Target Client Lead Profiles

**Status:** completed

## Acceptance criteria

- [x] Database migration creates `admin_lead_recordings` table for storing audio file metadata and AI JSON reports.
- [x] Backend endpoint `POST /v1/admin/leads/:leadId/recordings` accepts audio file uploads and invokes Gemini API.
- [x] Audio upload dropzone accepts `.mp3`, `.m4a`, `.wav`, `.webm`, `.ogg` files up to 25 MB.
- [x] Displays a loading spinner/progress state while Gemini AI processes the audio recording.
- [x] AI Sales Analysis Panel displays:
  - Overall Selling Score badge (1 to 10).
  - Key Strengths tags.
  - Areas Needed Improvement list.
  - Objection Handling tips & Closing Recommendations.
  - Accordion toggle to expand full audio transcript text.
- [x] Admins can play back uploaded audio directly using an embedded web audio player.
- [x] Past audio recordings and AI reports remain accessible per lead.
