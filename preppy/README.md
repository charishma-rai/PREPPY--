# Preppy 🐷 — Your AI Study Companion

I built Preppy because while prepping for my own exams, I noticed I was spending more time deciding *what* to study than actually studying. So this exists to kill that decision fatigue.

You give it your exam date, how many hours you actually have free each day (not just an average), your syllabus broken down subject → topic → subtopic, and how confident you are in each subject. It turns that into a real day-by-day study schedule on a calendar, weighted toward what you're weakest at, with buffer time before the exam so you're not sprinting to the finish line.

## What it actually does

- Builds your syllabus manually, unlimited depth (subject → topic → subtopic), fully editable
- Accounts for recurring commitments (college, work, coaching, gym, whatever) that eat into your study time
- Schedules individual subtopics, not whole subjects, weighted by how confident you are
- Auto-slots in revision sessions and mock tests based on what you choose
- Full calendar view, week or month, click any session to mark it complete, skip it, or reschedule
- Everything's saved locally, so closing the tab doesn't wipe your plan

## Stack

- React (Vite)
- Tailwind CSS
- lucide-react for icons
- Browser localStorage — no backend, nothing to spin up

## Running it locally

```bash
npm install
npm run dev
```

That's it. No env vars, no API keys, no backend to configure.