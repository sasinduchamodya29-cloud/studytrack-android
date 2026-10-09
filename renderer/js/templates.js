/* AUTO-GENERATED from the StudyTrack website templates - do not edit by hand */
function tplShell(ctx){with(ctx){var o="";
o+=`<div class="st-confirm-ov" id="stConfirmOv">
  <div class="st-confirm" id="stConfirm">
    <div class="st-confirm-icon" id="stConfirmIcon">⚠️</div>
    <div class="st-confirm-title" id="stConfirmTitle">Are you sure?</div>
    <div class="st-confirm-msg" id="stConfirmMsg"></div>
    <div class="st-confirm-btns" id="stConfirmBtns">
      <button class="st-confirm-btn secondary" id="stConfirmCancelBtn">Cancel</button>
      <button class="st-confirm-btn danger" id="stConfirmOkBtn">OK</button>
    </div>
  </div>
</div>
<div class="sidebar-overlay" id="sidebarOverlay"></div>
<aside class="sidebar" id="sidebar">
  <div class="sidebar-header">
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/dashboard" class="st-logo-link">
      <div class="st-logo-icon">
        <img src="logo.png" alt="StudyTrack">
      </div>
      <div class="st-logo-text">
        <span class="st-logo-name">`;
o+=PHP.s(siteName);
o+=`</span>
        <span class="st-logo-tag">BY EDURX</span>
      </div>
    </a>
  </div>
  <style>
  .st-logo-link {
    display: flex;
    align-items: center;
    gap: 11px;
    text-decoration: none;
    padding: 2px 4px;
    border-radius: 12px;
    transition: opacity .2s;
  }
  .st-logo-link:hover { opacity: .8; }
  .st-logo-icon {
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .st-logo-icon img {
    width: 36px; height: 36px;
    object-fit: contain;
    border-radius: 10px;
  }
  .st-logo-text {
    display: flex; flex-direction: column; gap: 1px;
    min-width: 0;
  }
  .st-logo-name {
    font-size: 16px;
    font-weight: 800;
    font-family: 'Sora', 'Inter', sans-serif;
    background: linear-gradient(135deg, #c7d2fe, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.2px;
    line-height: 1.2;
  }
  .st-logo-tag {
    font-size: 10px;
    font-weight: 500;
    color: var(--text-muted);
    letter-spacing: .3px;
    line-height: 1;
  }
  [data-theme="light"] .st-logo-name {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  [data-theme="light"] .st-logo-icon {
    background: linear-gradient(135deg, rgba(99,102,241,.1), rgba(168,85,247,.1));
    border-color: rgba(99,102,241,.2);
  }
  </style>
<style>
/* ── Themed Nav ───────────────────────────────────────────────── */
.nav-item { text-decoration:none; display:flex; align-items:center; gap:10px; padding:7px 10px; border-radius:10px; font-size:13px; font-weight:500; color:var(--text-secondary); transition:all .18s; margin-bottom:1px; position:relative; }
.nav-item:hover { color:var(--text-primary); background:rgba(255,255,255,.04); }
.nav-item.active { font-weight:600; color:#c4b5fd; background:rgba(99,102,241,.1); }
.nav-item.active::before { content:''; position:absolute; left:0; top:22%; bottom:22%; width:3px; background:linear-gradient(180deg,#6366f1,#a855f7); border-radius:0 3px 3px 0; }
.ni { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .18s; }
.ni svg { width:14px; height:14px; stroke-width:2; }
.ni-indigo  { background:rgba(99,102,241,.14);  color:#818cf8; }
.ni-cyan    { background:rgba(6,182,212,.14);   color:#22d3ee; }
.ni-emerald { background:rgba(16,185,129,.14);  color:#34d399; }
.ni-violet  { background:rgba(139,92,246,.14);  color:#a78bfa; }
.ni-amber   { background:rgba(245,158,11,.14);  color:#fbbf24; }
.ni-rose    { background:rgba(244,63,94,.14);   color:#fb7185; }
.ni-sky     { background:rgba(56,189,248,.14);  color:#7dd3fc; }
.ni-teal    { background:rgba(20,184,166,.14);  color:#2dd4bf; }
.ni-orange  { background:rgba(249,115,22,.14);  color:#fb923c; }
.ni-pink    { background:rgba(236,72,153,.14);  color:#f472b6; }
.ni-lime    { background:rgba(132,204,22,.14);  color:#a3e635; }
.ni-purple  { background:rgba(168,85,247,.14);  color:#c084fc; }
.ni-blue    { background:rgba(59,130,246,.14);  color:#60a5fa; }
.ni-fuchsia { background:rgba(217,70,239,.14);  color:#e879f9; }
.nav-item:hover .ni { filter:brightness(1.15); transform:scale(1.08); }
.nav-item.active .ni { filter:brightness(1.25); }

/* ── Collapsible nav sections ────────────────────────────────── */
.nav-section-title {
  display:flex; align-items:center; justify-content:space-between; gap:8px;
  cursor:pointer; user-select:none; -webkit-tap-highlight-color:transparent;
  padding:6px 10px; border-radius:8px; margin-bottom:2px;
  transition:background .18s, color .18s;
}
.nav-section-title:hover { background:rgba(255,255,255,.04); color:var(--text-secondary); }
.nav-section-title span:first-child { pointer-events:none; }
.nav-section-chevron {
  width:13px; height:13px; flex-shrink:0; color:var(--text-muted);
  transition:transform .32s cubic-bezier(.4,0,.2,1), color .18s;
  pointer-events:none;
}
.nav-section-title:hover .nav-section-chevron { color:var(--text-secondary); }
.nav-section.collapsed .nav-section-chevron { transform:rotate(-90deg); }

.nav-section-body {
  display:grid;
  grid-template-rows:1fr;
  transition:grid-template-rows .32s cubic-bezier(.4,0,.2,1), opacity .28s ease;
  opacity:1;
}
.nav-section.collapsed .nav-section-body {
  grid-template-rows:0fr;
  opacity:0;
}
.nav-section-body-inner { overflow:hidden; min-height:0; }
</style>

<nav class="sidebar-nav">

  <div class="nav-section" data-section="main">
    <div class="nav-section-title" onclick="toggleNavSection(this)">
      <span>Main</span>
      <svg class="nav-section-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
    </div>
    <div class="nav-section-body"><div class="nav-section-body-inner">
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/dashboard" class="nav-item `;
o+=PHP.s(activePage==='dashboard'?'active':'');
o+=`">
      <span class="ni ni-indigo"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg></span>
      Dashboard
    </a>
        <a href="`;
o+=PHP.s(siteUrl);
o+=`/subjects" class="nav-item `;
o+=PHP.s(activePage==='subjects'?'active':'');
o+=`">
      <span class="ni ni-violet"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span>
      Subjects
    </a>
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/study-log" class="nav-item `;
o+=PHP.s(activePage==='study-log'?'active':'');
o+=`">
      <span class="ni ni-cyan"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>
      Study Log
    </a>
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/pomodoro" class="nav-item `;
o+=PHP.s(activePage==='pomodoro'?'active':'');
o+=`">
      <span class="ni ni-violet"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></span>
      Focus Timer
    </a>
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/marks" class="nav-item `;
o+=PHP.s(activePage==='marks'?'active':'');
o+=`">
      <span class="ni ni-emerald"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></span>
      Marks & Results
    </a>

        <a href="`;
o+=PHP.s(siteUrl);
o+=`/class-hours" class="nav-item `;
o+=PHP.s(activePage==='class-hours'?'active':'');
o+=`">
      <span class="ni ni-orange"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span>
      Class Hours
    </a>
    
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/tasks" class="nav-item `;
o+=PHP.s(activePage==='tasks'?'active':'');
o+=`">
      <span class="ni ni-amber"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></span>
      Tasks Manage
    </a>
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/habit-tracker" class="nav-item `;
o+=PHP.s(activePage==='habit-tracker'?'active':'');
o+=`">
      <span class="ni ni-rose"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4.5 8-11.8A5.2 5.2 0 0 0 12 6a5.2 5.2 0 0 0-8 4.2C4 17.5 12 22 12 22z"/><path d="M9 11l2 2 4-4"/></svg></span>
      Habit Tracker
    </a>
    </div></div>
  </div>

  <div class="nav-section" data-section="analytics">
    <div class="nav-section-title" onclick="toggleNavSection(this)">
      <span>Analytics</span>
      <svg class="nav-section-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
    </div>
    <div class="nav-section-body"><div class="nav-section-body-inner">
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/analysis" class="nav-item `;
o+=PHP.s(activePage==='analysis'?'active':'');
o+=`">
      <span class="ni ni-sky"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></span>
      Analysis
    </a>
    <!--<a href="`;
o+=PHP.s(siteUrl);
o+=`/ai-analysis" class="nav-item `;
o+=PHP.s(activePage==='ai-analysis'?'active':'');
o+=`">
      <span class="ni ni-purple"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg></span>
      AI Analysis
    </a>-->
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/progress" class="nav-item `;
o+=PHP.s(activePage==='progress'?'active':'');
o+=`">
      <span class="ni ni-teal"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></span>
      Progress
    </a>
        <a href="`;
o+=PHP.s(siteUrl);
o+=`/report" class="nav-item `;
o+=PHP.s(activePage==='report'?'active':'');
o+=`">
      <span class="ni ni-sky"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></span>
      Reports
      <span class="st-nav-new-badge">Updated</span>
    </a>
    </div></div>
  </div>

  <div class="nav-section" data-section="practice">
    <div class="nav-section-title" onclick="toggleNavSection(this)">
      <span>Practice</span>
      <svg class="nav-section-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
    </div>
    <div class="nav-section-body"><div class="nav-section-body-inner">
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/syllabus" class="nav-item `;
o+=PHP.s(activePage==='syllabus'?'active':'');
o+=`">
      <span class="ni ni-emerald"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M9 7h7M9 11h7"/></svg></span>
      Syllabus Tracker
    </a>
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/quiz" class="nav-item `;
o+=PHP.s(activePage==='quiz'?'active':'');
o+=`">
      <span class="ni ni-purple"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span>
      Quiz Practice
    </a>
    </div></div>
  </div>

  <div class="nav-section" data-section="features">
    <div class="nav-section-title" onclick="toggleNavSection(this)">
      <span>Features</span>
      <svg class="nav-section-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
    </div>
    <div class="nav-section-body"><div class="nav-section-body-inner">
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/smart-planner" class="nav-item `;
o+=PHP.s(activePage==='smart-planner'?'active':'');
o+=`" style="position:relative;">
      <span class="ni ni-violet"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M8 14h3M8 18h5M15 14h1"/></svg></span>
      Smart Planner
      <span class="st-nav-new-badge">NEW</span>
    </a>
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/timetable" class="nav-item `;
o+=PHP.s(activePage==='timetable'?'active':'');
o+=`">
      <span class="ni ni-blue"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
      Timetable
    </a>
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/goals" class="nav-item `;
o+=PHP.s(activePage==='goals'?'active':'');
o+=`">
      <span class="ni ni-amber"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>
      Goals
    </a>
        <a href="`;
o+=PHP.s(siteUrl);
o+=`/notes" class="nav-item `;
o+=PHP.s(activePage==='notes'?'active':'');
o+=`">
      <span class="ni ni-pink"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></span>
      Notes & Flashcards
    </a>
    
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/past-papers" class="nav-item `;
o+=PHP.s(activePage==='past-papers'?'active':'');
o+=`">
      <span class="ni ni-rose"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></span>
      Past Papers
    </a>
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/exam-area" class="nav-item `;
o+=PHP.s(activePage==='exam-area'?'active':'');
o+=`">
      <span class="ni ni-orange"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3"/><circle cx="12" cy="13" r="8"/><path d="M9 2h6M12 2v3"/></svg></span>
      Exam Area
    </a>

    <a href="`;
o+=PHP.s(siteUrl);
o+=`/mind-map" class="nav-item `;
o+=PHP.s(activePage==='mind-map'?'active':'');
o+=`">
      <span class="ni ni-violet"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v5m0 0L6.5 17m5.5-4.5L17.5 17"/></svg></span>
      Mind Maps
    </a>
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/voice-notes" class="nav-item `;
o+=PHP.s(activePage==='voice-notes'?'active':'');
o+=`">
      <span class="ni ni-rose"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></span>
      Voice Notes
    </a>
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/subject-files" class="nav-item `;
o+=PHP.s(activePage==='subject-files'?'active':'');
o+=`">
      <span class="ni ni-cyan"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span>
      Subject Files
    </a>
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/reminders" class="nav-item `;
o+=PHP.s(activePage==='reminders'?'active':'');
o+=`">
      <span class="ni ni-violet"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></span>
      Reminders
    </a>
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/heatmap" class="nav-item `;
o+=PHP.s(activePage==='heatmap'?'active':'');
o+=`">
      <span class="ni ni-indigo"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg></span>
      Study Heatmap
    </a>

    <a href="`;
o+=PHP.s(siteUrl);
o+=`/planet" class="nav-item `;
o+=PHP.s(activePage==='planet'?'active':'');
o+=`">
      <span class="ni ni-teal"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><ellipse cx="12" cy="12" rx="10" ry="3.2"/></svg></span>
      My Planet
      <span class="st-nav-new-badge">NEW</span>
    </a>
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/achievements" class="nav-item `;
o+=PHP.s(activePage==='achievements'?'active':'');
o+=`">
      <span class="ni ni-amber"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg></span>
      Achievements
    </a>
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/leaderboard" class="nav-item `;
o+=PHP.s(activePage==='leaderboard'?'active':'');
o+=`">
      <span class="ni ni-fuchsia"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
      Leaderboard
    </a>
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/daily-battle" class="nav-item `;
o+=PHP.s(activePage==='daily-battle'?'active':'');
o+=`">
      <span class="ni ni-rose"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/><path d="M14.5 6.5 18 3h3v3l-3.5 3.5"/><path d="M5 14l4 4"/><path d="M7 17l-3 3"/><path d="M3 19l2 2"/></svg></span>
      Daily Battle
      <span class="st-nav-new-badge">NEW</span>
    </a>
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/referrals" class="nav-item `;
o+=PHP.s(activePage==='referrals'?'active':'');
o+=`">
      <span class="ni ni-amber"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8"/><path d="M16.5 8a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8"/></svg></span>
      Referrals
    </a>

    <a href="`;
o+=PHP.s(siteUrl);
o+=`/guide" class="nav-item `;
o+=PHP.s(activePage==='guide'?'active':'');
o+=`">
      <span class="ni ni-indigo"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span>
      User Guide
    </a>

    </div></div>
  </div>

  <a href="`;
o+=PHP.s(siteUrl);
o+=`/upgrade" class="nav-item `;
o+=PHP.s(activePage==='upgrade'?'active':'');
o+=`" style="`;
o+=PHP.s(isProUser ? '' : 'background:linear-gradient(135deg,rgba(245,158,11,.14),rgba(245,158,11,.05));border:1px solid rgba(245,158,11,.3);border-radius:10px;');
o+=`">
    <span class="ni" style="background:linear-gradient(135deg,#f59e0b,#f97316);color:#fff;"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2L12 16.4 5.7 21l2.3-7.2L2 9.2h7.6z"/></svg></span>
    `;
o+=PHP.s(isPremiumUser ? 'StudyTrack Premium ✓ 👑' : (isProUser ? 'StudyTrack Pro ✓' : 'Upgrade to Pro'));
o+=`
  </a>

</nav>

<script>
// ── Collapsible sidebar topic sections ──────────────────────────
(function(){
  var STORE_KEY = 'stNavCollapsed';
  var collapsedMap = {};
  try { collapsedMap = JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch(e){ collapsedMap = {}; }

  // Restore saved collapsed state on load (no animation on first paint)
  document.querySelectorAll('.nav-section[data-section]').forEach(function(sec){
    var key = sec.getAttribute('data-section');
    if (collapsedMap[key]) sec.classList.add('collapsed');
  });

  // Always keep the section with the current active page visible
  var activeItem = document.querySelector('.nav-section .nav-item.active');
  if (activeItem) {
    var activeSection = activeItem.closest('.nav-section');
    if (activeSection && activeSection.classList.contains('collapsed')) {
      activeSection.classList.remove('collapsed');
      collapsedMap[activeSection.getAttribute('data-section')] = false;
      try { localStorage.setItem(STORE_KEY, JSON.stringify(collapsedMap)); } catch(e){}
    }
  }

  window.toggleNavSection = function(titleEl) {
    var section = titleEl.closest('.nav-section');
    if (!section) return;
    var key = section.getAttribute('data-section');
    var isCollapsed = section.classList.toggle('collapsed');
    collapsedMap[key] = isCollapsed;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(collapsedMap)); } catch(e){}
  };
})();
</script>

  <!-- ⭐ Rate & Review + Contact — hide on scroll-down, show on scroll-up -->
  <div id="sidebarActionBtns" style="
    overflow:hidden;
    max-height:200px;
    opacity:1;
    transition:max-height 0.35s cubic-bezier(.4,0,.2,1), opacity 0.3s ease, margin 0.35s ease;
    margin-bottom:0;
  ">

    <!-- Contact & Support (highlighted when on the Support Tickets pages) -->
    `;
var __supActive = (activePage === 'support');
var __supBg     = __supActive ? 'rgba(99,102,241,0.20)' : 'rgba(99,102,241,0.08)';
var __supBorder = __supActive ? 'var(--accent)'         : 'rgba(99,102,241,0.2)';
var __supColor  = __supActive ? 'var(--accent)'         : 'var(--text-secondary)';
var __supShadow = __supActive ? '0 0 0 1px rgba(99,102,241,0.25), 0 4px 16px rgba(99,102,241,0.22)' : 'none';
var __supUnread = 0;
if(PHP.isset(()=>_SESSION['user_id'])){
var __supUnread = supportUserUnreadCount(pdo, _SESSION['user_id']);
}
o+=`
    `;
if(__supUnread > 0){
o+=`
    <style>
      @keyframes stSupPulse{0%{box-shadow:0 0 0 0 rgba(239,68,68,.65)}70%{box-shadow:0 0 0 7px rgba(239,68,68,0)}100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}}
      .st-sup-dot{width:8px;height:8px;border-radius:50%;background:#ef4444;flex-shrink:0;animation:stSupPulse 1.6s infinite}
      .st-sup-count{min-width:20px;height:20px;padding:0 6px;border-radius:99px;background:linear-gradient(135deg,#ef4444,#f97316);color:#fff;font-size:11px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(239,68,68,.35)}
    </style>
    `;
}
o+=`
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/contact" class="`;
o+=PHP.s(__supActive ? 'active' : '');
o+=`"`;
o+=PHP.s(__supUnread > 0 ? ' title="' + ~~__supUnread + ' new support ' + (__supUnread === 1 ? 'reply' : 'replies') + '"' : '');
o+=` style="
      display:flex;align-items:center;gap:10px;
      margin:0 12px 8px;padding:11px 14px;
      border-radius:12px;text-decoration:none;
      background:`;
o+=PHP.s(__supBg);
o+=`;
      border:1px solid `;
o+=PHP.s(__supBorder);
o+=`;
      color:`;
o+=PHP.s(__supColor);
o+=`;
      box-shadow:`;
o+=PHP.s(__supShadow);
o+=`;
      font-size:13px;font-weight:`;
o+=PHP.s(__supActive ? '700' : '600');
o+=`;
      transition:all 0.2s;
    "
    onmouseover="this.style.background='rgba(99,102,241,0.18)';this.style.color='var(--accent)';this.style.borderColor='rgba(99,102,241,0.4)'"
    onmouseout="this.style.background='`;
o+=PHP.s(__supBg);
o+=`';this.style.color='`;
o+=PHP.s(__supColor);
o+=`';this.style.borderColor='`;
o+=PHP.s(__supBorder);
o+=`'">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;opacity:0.8">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      Contact &amp; Support
      `;
if(__supUnread > 0){
o+=`
      <span style="margin-left:auto;display:flex;align-items:center;gap:7px">
        <span class="st-sup-dot"></span>
        <span class="st-sup-count">`;
o+=PHP.s(__supUnread > 99 ? '99+' : ~~__supUnread);
o+=`</span>
      </span>
      `;
}
o+=`
    </a>
  </div>

  <script>
  (function(){
    var sidebar = document.getElementById('sidebar');
    var btns    = document.getElementById('sidebarActionBtns');
    if (!sidebar || !btns) return;

    var lastY   = 0;
    var ticking = false;
    var hidden  = false;

    sidebar.addEventListener('scroll', function(){
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function(){
        var cur = sidebar.scrollTop;
        if (cur > lastY && cur > 40) {
          // scrolling DOWN → hide buttons
          if (!hidden) {
            btns.style.maxHeight = '0';
            btns.style.opacity   = '0';
            btns.style.marginBottom = '-8px';
            hidden = true;
          }
        } else {
          // scrolling UP → show buttons
          if (hidden) {
            btns.style.maxHeight = '200px';
            btns.style.opacity   = '1';
            btns.style.marginBottom = '0';
            hidden = false;
          }
        }
        lastY   = cur;
        ticking = false;
      });
    }, { passive: true });
  })();
  </script>

  <div class="sidebar-user">
    <div class="user-card" style="display:flex;align-items:center;gap:10px;padding:12px 14px;">
      <a href="`;
o+=PHP.s(siteUrl);
o+=`/profile" style="display:flex;align-items:center;gap:10px;text-decoration:none;flex:1;min-width:0;">
        <div class="user-avatar" style="overflow:hidden;padding:0;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          `;
if(PHP.T(userAvatar)){
o+=`
          <img src="`;
o+=PHP.s(userAvatar);
o+=`" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" alt="avatar">
          `;
}else{
o+=`
          `;
o+=PHP.s(userInitial);
o+=`
          `;
}
o+=`
        </div>
        <div class="user-info" style="min-width:0;">
          <div class="name" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">`;
o+=PHP.s(userName);
o+=`</div>
          <div class="role">Student</div>
        </div>
      </a>
      <a href="`;
o+=PHP.s(siteUrl);
o+=`/logout" title="Logout"
         style="
           width:34px;height:34px;border-radius:9px;flex-shrink:0;
           display:flex;align-items:center;justify-content:center;
           background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);
           color:#ef4444;text-decoration:none;transition:all 0.2s;
         "
         onmouseover="this.style.background='rgba(239,68,68,0.18)';this.style.borderColor='rgba(239,68,68,0.5)'"
         onmouseout="this.style.background='rgba(239,68,68,0.08)';this.style.borderColor='rgba(239,68,68,0.2)'">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </a>
    </div>
  </div>
</aside>
<script>
// ── Sidebar: icon-only rail toggle + hover labels ───────────────
(function(){
  var KEY='stSidebarMini', root=document.documentElement;
  var sidebar=document.getElementById('sidebar');
  if(!sidebar) return;
  var isDesktop=function(){ return window.innerWidth>768; };
  var isMini=function(){ return root.classList.contains('sb-mini') && isDesktop(); };

  // enable width/margin animation only after first paint (no flash on load)
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ root.classList.add('sb-anim'); }); });

  function setMini(m){
    root.classList.toggle('sb-mini',m);
    try{ localStorage.setItem(KEY,m?'1':'0'); }catch(e){}
    hideTip();
  }
  // the button lives in the topbar (rendered after this script) → delegate from document
  document.addEventListener('click',function(e){
    if(e.target.closest && e.target.closest('#sbCollapseBtn')) setMini(!root.classList.contains('sb-mini'));
  });
  document.addEventListener('keydown',function(e){
    if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&!e.altKey&&(e.key==='b'||e.key==='B')){
      var t=e.target, tag=t&&t.tagName;
      if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||(t&&t.isContentEditable)) return;
      if(!isDesktop()) return;
      e.preventDefault(); setMini(!root.classList.contains('sb-mini'));
    }
  });

  // labels: own text nodes (+ native title, moved to data-label so it doesn't double up)
  function labelOf(a){
    var txt='';
    a.childNodes.forEach(function(n){ if(n.nodeType===3) txt+=n.textContent; });
    txt=txt.replace(/\\s+/g,' ').trim();
    var ttl=a.getAttribute('data-title')||'';
    if(txt&&ttl) return txt+' · '+ttl;
    return txt||ttl;
  }
  sidebar.querySelectorAll('a[title]').forEach(function(a){
    a.setAttribute('data-title',a.getAttribute('title')); a.removeAttribute('title');
  });

  var tip=document.createElement('div'); tip.className='sb-tip'; document.body.appendChild(tip);
  function hideTip(){ tip.classList.remove('show'); }
  sidebar.addEventListener('mouseover',function(e){
    if(!isMini()) return hideTip();
    var a=e.target.closest('a'); if(!a||!sidebar.contains(a)) return hideTip();
    var text=labelOf(a); if(!text) return hideTip();
    tip.textContent=text;
    var r=a.getBoundingClientRect(), h=tip.offsetHeight||30;
    tip.style.left=(r.right+12)+'px';
    tip.style.top=Math.max(8,r.top+r.height/2-h/2)+'px';
    tip.classList.add('show');
  });
  sidebar.addEventListener('mouseleave',hideTip);
  sidebar.addEventListener('scroll',hideTip,true);
  window.addEventListener('resize',hideTip);
})();
</script>


</script>

<div class="main-content">
  <div class="topbar">
    <div class="topbar-left">
      <button type="button" class="sb-collapse-btn" id="sbCollapseBtn" title="Collapse / expand sidebar (Ctrl+B)" aria-label="Toggle sidebar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>
      </button>
      <button class="sidebar-toggle" id="sidebarToggle">☰</button>
      <div>
        <div class="topbar-title">`;
o+=PHP.s(E(title));
o+=`</div>
      </div>
    </div>
    <div class="topbar-right" style="display:flex;align-items:center;gap:8px;">

      <!-- ── Shared topbar icon style ── -->
      <!-- All icons: 36x36, border-radius:10px, border:1px solid var(--border), bg:var(--bg-secondary) -->

      <!-- Smart Center Button -->
      <a href="`;
o+=PHP.s(siteUrl);
o+=`/smart/" title="Smart Center"
         style="
           display:inline-flex;align-items:center;gap:6px;
           padding:0 14px;height:36px;border-radius:10px;
           background:`;
o+=PHP.s(activePage==='smart' ? 'rgba(99,102,241,.12)' : 'var(--bg-secondary)');
o+=`;
           border:1px solid `;
o+=PHP.s(activePage==='smart' ? 'var(--accent)' : 'var(--border)');
o+=`;
           color:`;
o+=PHP.s(activePage==='smart' ? 'var(--accent)' : 'var(--text-primary)');
o+=`;text-decoration:none;
           font-size:12px;font-weight:700;flex-shrink:0;
           transition:all 0.2s;white-space:nowrap;letter-spacing:0.2px;
         "
         onmouseover="this.style.background='var(--accent)';this.style.color='#fff';this.style.borderColor='var(--accent)'"
         onmouseout="this.style.background='`;
o+=PHP.s(activePage==='smart' ? 'rgba(99,102,241,.12)' : 'var(--bg-secondary)');
o+=`';this.style.color='`;
o+=PHP.s(activePage==='smart' ? 'var(--accent)' : 'var(--text-primary)');
o+=`';this.style.borderColor='`;
o+=PHP.s(activePage==='smart' ? 'var(--accent)' : 'var(--border)');
o+=`'">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z"/>
        </svg>
        <span class="campus-btn-text">Smart</span>
      </a>

      <!-- Music Button -->
      <a href="`;
o+=PHP.s(siteUrl);
o+=`/music" title="Music"
         style="
           display:inline-flex;align-items:center;gap:6px;
           padding:0 14px;height:36px;border-radius:10px;
           background:`;
o+=PHP.s(activePage==='music' ? 'rgba(30,215,96,.14)' : 'var(--bg-secondary)');
o+=`;
           border:1px solid `;
o+=PHP.s(activePage==='music' ? '#1ED760' : 'var(--border)');
o+=`;
           color:`;
o+=PHP.s(activePage==='music' ? '#1ED760' : 'var(--text-primary)');
o+=`;text-decoration:none;
           font-size:12px;font-weight:700;flex-shrink:0;
           transition:all 0.2s;white-space:nowrap;letter-spacing:0.2px;
         "
         onmouseover="this.style.background='#1ED760';this.style.color='#fff';this.style.borderColor='#1ED760'"
         onmouseout="this.style.background='`;
o+=PHP.s(activePage==='music' ? 'rgba(30,215,96,.14)' : 'var(--bg-secondary)');
o+=`';this.style.color='`;
o+=PHP.s(activePage==='music' ? '#1ED760' : 'var(--text-primary)');
o+=`';this.style.borderColor='`;
o+=PHP.s(activePage==='music' ? '#1ED760' : 'var(--border)');
o+=`'">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
        </svg>
        <span class="campus-btn-text">Music</span>
      </a>

      <!-- Dark / Light mode toggle 
      <button id="themeToggleBtn" onclick="toggleTheme()" title="Toggle dark/light mode" style="
        width:36px;height:36px;border-radius:10px;
        border:1px solid var(--border);
        background:var(--bg-secondary);
        color:var(--text-primary);cursor:pointer;
        display:inline-flex;align-items:center;justify-content:center;
        transition:all 0.2s;flex-shrink:0;padding:0;
      "
      onmouseover="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'"
      onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text-primary)'">
        <!-- Moon icon (dark mode) 
        <svg id="icon-moon" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
        <!-- Sun icon (light mode) 
        <svg id="icon-sun" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      </button> -->


      <!-- ── Settings Icon ──────────────────────────────── -->
      <a href="`;
o+=PHP.s(siteUrl);
o+=`/settings" title="Settings" style="
           width:36px;height:36px;border-radius:10px;
           border:1px solid `;
o+=PHP.s(activePage==='settings' ? 'var(--accent)' : 'var(--border)');
o+=`;
           background:`;
o+=PHP.s(activePage==='settings' ? 'rgba(99,102,241,.12)' : 'var(--bg-secondary)');
o+=`;
           color:`;
o+=PHP.s(activePage==='settings' ? 'var(--accent)' : 'var(--text-primary)');
o+=`;
           display:inline-flex;align-items:center;justify-content:center;
           flex-shrink:0;text-decoration:none;transition:all .2s;"
         onmouseover="this.style.borderColor='var(--accent)';this.style.color='var(--accent)';this.style.background='rgba(99,102,241,.1)'"
         onmouseout="this.style.borderColor='`;
o+=PHP.s(activePage==='settings' ? 'var(--accent)' : 'var(--border)');
o+=`';this.style.color='`;
o+=PHP.s(activePage==='settings' ? 'var(--accent)' : 'var(--text-primary)');
o+=`';this.style.background='`;
o+=PHP.s(activePage==='settings' ? 'rgba(99,102,241,.12)' : 'var(--bg-secondary)');
o+=`'">
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </a>

      <!-- ── Notification Bell ─────────────────────────── -->
      <div id="notifBellWrap" style="position:relative;flex-shrink:0;">
        <button id="notifBellBtn" onclick="toggleNotifPanel()" title="Notifications" style="
          width:36px;height:36px;border-radius:10px;
          border:1px solid `;
o+=PHP.s(activePage==='notifications' ? 'var(--accent)' : 'var(--border)');
o+=`;
          background:`;
o+=PHP.s(activePage==='notifications' ? 'rgba(99,102,241,.12)' : 'var(--bg-secondary)');
o+=`;
          color:`;
o+=PHP.s(activePage==='notifications' ? 'var(--accent)' : 'var(--text-primary)');
o+=`;
          cursor:pointer;display:inline-flex;
          align-items:center;justify-content:center;
          transition:all 0.2s;position:relative;padding:0;
        "
        onmouseover="this.style.borderColor='var(--accent)';this.style.color='var(--accent)';this.style.background='rgba(99,102,241,.1)'"
        onmouseout="this.style.borderColor='`;
o+=PHP.s(activePage==='notifications' ? 'var(--accent)' : 'var(--border)');
o+=`';this.style.color='`;
o+=PHP.s(activePage==='notifications' ? 'var(--accent)' : 'var(--text-primary)');
o+=`';this.style.background='`;
o+=PHP.s(activePage==='notifications' ? 'rgba(99,102,241,.12)' : 'var(--bg-secondary)');
o+=`'"
        ><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><span id="notifBadge" style="
          display:none;position:absolute;top:-4px;right:-4px;
          background:#ef4444;color:#fff;font-size:9px;font-weight:800;
          min-width:16px;height:16px;border-radius:8px;
          align-items:center;justify-content:center;
          padding:0 3px;line-height:1;border:2px solid var(--bg-card);
        "></span></button>

        <!-- Notification Dropdown Panel -->
        <div id="notifPanel" style="
          display:none;position:fixed;right:12px;top:62px;
          width:340px;max-width:calc(100vw - 24px);
          background:var(--bg-card);border:1px solid var(--border);
          border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.35);
          z-index:99999;overflow:hidden;
          animation:fadeIn 0.18s ease;
        ">
          <!-- Panel header -->
          <div style="display:flex;align-items:center;justify-content:space-between;
            padding:14px 16px;border-bottom:1px solid var(--border);">
            <div style="font-size:14px;font-weight:700;color:var(--text-primary)">
              🔔 Notifications
              <span id="notifPanelCount" style="
                background:rgba(99,102,241,0.15);color:var(--accent);
                font-size:11px;padding:2px 7px;border-radius:20px;margin-left:6px;
              "></span>
            </div>
            <button onclick="notifMarkAllRead()" style="
              background:none;border:none;color:var(--accent);
              font-size:12px;font-weight:600;cursor:pointer;padding:4px 8px;
              border-radius:6px;transition:background .15s;
            " onmouseover="this.style.background='rgba(99,102,241,0.1)'"
               onmouseout="this.style.background='none'">Mark all read</button>
          </div>

          <!-- Notification list -->
          <div id="notifList" style="
            max-height:360px;overflow-y:auto;
            scrollbar-width:thin;
            border-radius:0 0 16px 16px;
          ">
            <div id="notifLoading" style="
              text-align:center;padding:28px 16px;
              color:var(--text-muted);font-size:13px;
            ">
              <div style="display:inline-block;width:20px;height:20px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:notifSpin 0.7s linear infinite;margin-bottom:8px"></div>
              <div>Loading...</div>
            </div>
            <div id="notifEmpty" style="
              text-align:center;padding:32px 16px;
              color:var(--text-muted);font-size:13px;display:none;
            ">
              <div style="font-size:32px;margin-bottom:8px">🔕</div>
              <div>No notifications yet</div>
            </div>
            <div id="notifError" style="
              text-align:center;padding:24px 16px;
              color:var(--text-muted);font-size:13px;display:none;
            ">
              <div style="font-size:28px;margin-bottom:8px">⚠️</div>
              <div>Could not load notifications</div>
              <button onclick="loadNotifications()" style="margin-top:8px;background:none;border:1px solid var(--border);color:var(--accent);font-size:12px;padding:4px 12px;border-radius:8px;cursor:pointer;">Retry</button>
            </div>
          </div>

          <!-- Panel footer -->
          <div style="padding:10px 16px;border-top:1px solid var(--border);text-align:center;">
            <a href="`;
o+=PHP.s(siteUrl);
o+=`/notifications" style="
              font-size:12px;color:var(--accent);font-weight:600;text-decoration:none;
            ">View all notifications</a>
          </div>
        </div>
      </div>
      <!-- ── End Notification Bell ─────────────────────── -->

      <a href="`;
o+=PHP.s(siteUrl);
o+=`/profile" class="user-avatar" style="width:36px;height:36px;cursor:pointer;text-decoration:none;overflow:hidden;padding:0;display:inline-flex;align-items:center;justify-content:center;">
        `;
if(PHP.T(userAvatar)){
o+=`
        <img src="`;
o+=PHP.s(userAvatar);
o+=`" style="width:100%;height:100%;object-fit:cover;border-radius:10px;" alt="avatar">
        `;
}else{
o+=`
        <span style="font-size:14px;font-weight:700;">`;
o+=PHP.s(userInitial);
o+=`</span>
        `;
}
o+=`
      </a>
    </div>
  </div>

  `;
if(PHP.isset(()=>_SESSION['user_id'])){
o+=`
  <!-- ── FLOATING QUICK ACCESS (bubble style) ───────────────────────────── -->
  <style>
  /* Main FAB */
  #dqfab {
    position: fixed;
    bottom: 28px;
    right: 22px;
    z-index: 9999;
    width: 56px; height: 56px;
    border-radius: 50%;
    background: linear-gradient(145deg, #7c7ff7, #6366f1 40%, #a855f7 100%);
    box-shadow:
      0 8px 32px rgba(99,102,241,.5),
      0 2px 8px rgba(0,0,0,.4),
      inset 0 1px 0 rgba(255,255,255,.25),
      inset 0 -1px 0 rgba(0,0,0,.2);
    border: none;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: transform .28s cubic-bezier(.34,1.56,.64,1), box-shadow .25s ease;
    outline: none;
    overflow: hidden;
  }
  #dqfab::after {
    content: '';
    position: absolute;
    top: -50%; left: -60%;
    width: 40%; height: 200%;
    background: linear-gradient(105deg, transparent, rgba(255,255,255,.22), transparent);
    transform: skewX(-15deg);
    animation: fab-shimmer 3s ease-in-out infinite;
    pointer-events: none;
  }
  @keyframes fab-shimmer {
    0%,100% { left: -60%; opacity: 0; }
    30%      { opacity: 1; }
    60%      { left: 130%; opacity: 0; }
  }
  #dqfab:hover {
    transform: translateY(-3px) scale(1.06);
    box-shadow: 0 14px 40px rgba(99,102,241,.6), 0 4px 12px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.3);
  }
  #dqfab.open {
    transform: rotate(45deg) scale(1.04);
    background: linear-gradient(145deg, #f87171, #ef4444 50%, #dc2626);
    box-shadow: 0 10px 32px rgba(239,68,68,.45), inset 0 1px 0 rgba(255,255,255,.2);
  }
  #dqfab-icon { transition: all .28s cubic-bezier(.34,1.56,.64,1); pointer-events: none; position: relative; z-index: 1; }

  .fi-dot { transform-origin: center; transition: transform .32s cubic-bezier(.34,1.4,.64,1), opacity .22s ease; }
  #fi-d1 { animation: fi-float1 3s ease-in-out infinite; }
  #fi-d2 { animation: fi-float2 3s ease-in-out infinite; }
  #fi-d3 { animation: fi-float3 3s ease-in-out infinite; }
  #fi-d4 { animation: fi-float4 3s ease-in-out infinite; }
  @keyframes fi-float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-0.5px,-0.8px)} }
  @keyframes fi-float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(0.8px,-0.5px)} }
  @keyframes fi-float3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-0.8px,0.5px)} }
  @keyframes fi-float4 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(0.5px,0.8px)} }
  #dqfab.open #fi-d1 { transform: translate(3px,3px) rotate(45deg) scaleX(2.4) scaleY(0.28); animation: none; }
  #dqfab.open #fi-d2 { transform: translate(-3px,3px) rotate(-45deg) scaleX(2.4) scaleY(0.28); animation: none; }
  #dqfab.open #fi-d3 { transform: translate(3px,-3px) rotate(-45deg) scaleX(2.4) scaleY(0.28); animation: none; }
  #dqfab.open #fi-d4 { transform: translate(-3px,-3px) rotate(45deg) scaleX(2.4) scaleY(0.28); animation: none; }

  #dqfab-ring1, #dqfab-ring2 {
    position: absolute; inset: 0; border-radius: 50%;
    border: 2px solid rgba(99,102,241,.5);
    animation: fab-pulse 2.4s ease-out infinite;
    pointer-events: none;
  }
  #dqfab-ring2 { animation-delay: .8s; border-color: rgba(168,85,247,.4); }
  @keyframes fab-pulse {
    0%   { transform: scale(1);    opacity: .7; }
    70%  { transform: scale(1.55); opacity: 0; }
    100% { transform: scale(1.55); opacity: 0; }
  }

  /* Bubble stack — each item is a round bubble that pops up the FAB column */
  #dqbubbles {
    position: fixed;
    bottom: 96px;
    right: 22px;
    z-index: 9998;
    display: flex;
    flex-direction: column-reverse;
    align-items: flex-end;
    gap: 14px;
    pointer-events: none;
  }
  .dqb {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    transform: scale(.3) translateY(14px);
    opacity: 0;
    pointer-events: none;
    transition: transform .34s cubic-bezier(.34,1.56,.64,1), opacity .22s ease;
  }
  #dqbubbles.open .dqb {
    transform: scale(1) translateY(0);
    opacity: 1;
    pointer-events: auto;
  }
  #dqbubbles.open .dqb:nth-child(1) { transition-delay: .19s; }
  #dqbubbles.open .dqb:nth-child(2) { transition-delay: .16s; }
  #dqbubbles.open .dqb:nth-child(3) { transition-delay: .13s; }
  #dqbubbles.open .dqb:nth-child(4) { transition-delay: .10s; }
  #dqbubbles.open .dqb:nth-child(5) { transition-delay: .07s; }
  #dqbubbles.open .dqb:nth-child(6) { transition-delay: .04s; }
  #dqbubbles.open .dqb:nth-child(7) { transition-delay: .01s; }
  /* reverse column means first child renders at bottom (closest to FAB) visually due to column-reverse */

  .dqb-label {
    font-size: 12px;
    font-weight: 700;
    color: #f1f5f9;
    background: #16161f;
    border: 1px solid rgba(99,102,241,.25);
    padding: 6px 12px;
    border-radius: 99px;
    white-space: nowrap;
    box-shadow: 0 6px 18px rgba(0,0,0,.4);
  }
  [data-theme="light"] .dqb-label {
    background: #ffffff;
    color: #1e293b;
    border-color: rgba(99,102,241,.3);
    box-shadow: 0 6px 18px rgba(0,0,0,.12);
  }
  .dqb-bubble {
    position: relative;
    width: 46px; height: 46px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 8px 22px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.15);
    transition: transform .18s, box-shadow .18s;
  }
  .dqb:hover .dqb-bubble { transform: scale(1.1); }
  .dqb:hover .dqb-label { color: var(--accent, #818cf8); }
  .dqb-badge {
    position: absolute;
    top: -3px; right: -3px;
    background: #ef4444;
    color: #fff;
    font-size: 10px;
    font-weight: 800;
    border-radius: 99px;
    min-width: 16px; height: 16px;
    display: flex; align-items: center; justify-content: center;
    padding: 0 4px;
    border: 2px solid #16161f;
  }
  [data-theme="light"] .dqb-badge { border-color: #ffffff; }

  /* primary (Log Study) bubble — slightly larger to stand out */
  .dqb-primary .dqb-bubble { width: 50px; height: 50px; }
  .dqb-primary .dqb-label { font-weight: 800; }
  </style>

  <!-- FAB -->
  <button id="dqfab" onclick="dqToggle()" aria-label="Quick Access">
    <div id="dqfab-ring1"></div>
    <div id="dqfab-ring2"></div>
    <svg id="dqfab-icon" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect class="fi-dot" id="fi-d1" x="3"  y="3"  width="6" height="6" rx="2" fill="white"/>
      <rect class="fi-dot" id="fi-d2" x="13" y="3"  width="6" height="6" rx="2" fill="white"/>
      <rect class="fi-dot" id="fi-d3" x="3"  y="13" width="6" height="6" rx="2" fill="white"/>
      <rect class="fi-dot" id="fi-d4" x="13" y="13" width="6" height="6" rx="2" fill="white"/>
    </svg>
  </button>

  <!-- Bubble stack -->
  <div id="dqbubbles">

    <!-- Subjects -->
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/subjects" class="dqb">
      <span class="dqb-label">Subjects</span>
      <span class="dqb-bubble" style="background:rgba(239,68,68,.16);border:1px solid rgba(239,68,68,.3)">
        <svg width="18" height="18" fill="none" stroke="#ef4444" stroke-width="2.3" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
      </span>
    </a>

    <!-- Class Hours -->
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/class-hours" class="dqb">
      <span class="dqb-label">Class Hours</span>
      <span class="dqb-bubble" style="background:rgba(251,191,36,.16);border:1px solid rgba(251,191,36,.3)">
        <svg width="18" height="18" fill="none" stroke="#fbbf24" stroke-width="2.3" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
      </span>
    </a>

    <!-- Heatmap -->
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/heatmap" class="dqb">
      <span class="dqb-label">Heatmap</span>
      <span class="dqb-bubble" style="background:rgba(16,185,129,.16);border:1px solid rgba(16,185,129,.3)">
        <svg width="18" height="18" fill="none" stroke="#10b981" stroke-width="2.3" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
      </span>
    </a>

    <!-- Analysis -->
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/analysis" class="dqb">
      <span class="dqb-label">Analysis</span>
      <span class="dqb-bubble" style="background:rgba(168,85,247,.16);border:1px solid rgba(168,85,247,.3)">
        <svg width="18" height="18" fill="none" stroke="#a855f7" stroke-width="2.3" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
      </span>
    </a>

    <!-- Add Marks -->
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/marks" class="dqb">
      <span class="dqb-label">Add Marks</span>
      <span class="dqb-bubble" style="background:rgba(6,182,212,.16);border:1px solid rgba(6,182,212,.3)">
        <svg width="18" height="18" fill="none" stroke="#06b6d4" stroke-width="2.3" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
      </span>
    </a>

    <!-- Tasks -->
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/tasks" class="dqb">
      <span class="dqb-label">Tasks</span>
      <span class="dqb-bubble" style="background:rgba(245,158,11,.16);border:1px solid rgba(245,158,11,.3)">
        <svg width="18" height="18" fill="none" stroke="#f59e0b" stroke-width="2.3" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        `;
if(dqPendingTasks > 0){
o+=`<span class="dqb-badge">`;
o+=PHP.s(dqPendingTasks > 99 ? '99+' : dqPendingTasks);
o+=`</span>`;
}
o+=`
      </span>
    </a>

    <!-- Log Study — primary -->
    <a href="`;
o+=PHP.s(siteUrl);
o+=`/study-log" class="dqb dqb-primary">
      <span class="dqb-label">⚡ Log Study Session</span>
      <span class="dqb-bubble" style="background:linear-gradient(135deg,#6366f1,#a855f7);border:none">
        <svg width="20" height="20" fill="none" stroke="#fff" stroke-width="2.3" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </span>
    </a>

  </div>

  <script>
  function dqToggle(){
    var fab   = document.getElementById('dqfab');
    var stack = document.getElementById('dqbubbles');
    var open  = stack.classList.toggle('open');
    fab.classList.toggle('open', open);
  }
  // Close on outside click
  document.addEventListener('click', function(e){
    var fab   = document.getElementById('dqfab');
    var stack = document.getElementById('dqbubbles');
    if (!fab || !stack) return;
    if (!fab.contains(e.target) && !stack.contains(e.target)) {
      fab.classList.remove('open');
      stack.classList.remove('open');
    }
  });
  // Close on bubble click
  document.querySelectorAll('.dqb').forEach(function(a){
    a.addEventListener('click', function(){
      document.getElementById('dqfab').classList.remove('open');
      document.getElementById('dqbubbles').classList.remove('open');
    });
  });
  </script>
  <!-- ── End Floating Quick Access ───────────────────────────── -->
  `;
}
o+=`

<script>
// Global promise-based confirm dialog — drop-in replacement for browser confirm()
function stConfirm(msg, opts) {
  opts = opts || {};
  return new Promise(function(resolve){
    document.getElementById('stConfirmIcon').textContent  = opts.icon  || '⚠️';
    document.getElementById('stConfirmTitle').textContent = opts.title || 'Are you sure?';
    document.getElementById('stConfirmMsg').textContent   = msg || '';
    var okBtn = document.getElementById('stConfirmOkBtn');
    var cancelBtn = document.getElementById('stConfirmCancelBtn');
    okBtn.textContent = opts.okLabel || 'OK';
    cancelBtn.textContent = opts.cancelLabel || 'Cancel';
    okBtn.className = 'st-confirm-btn ' + (opts.okStyle || 'danger');
    var ov = document.getElementById('stConfirmOv');
    function cleanup(result){
      ov.classList.remove('show');
      okBtn.onclick = null; cancelBtn.onclick = null;
      resolve(result);
    }
    okBtn.onclick     = function(){ cleanup(true); };
    cancelBtn.onclick = function(){ cleanup(false); };
    ov.classList.add('show');
  });
}
</script>`;
return o;}}
function tplDash(ctx){with(ctx){var o="";
o+=`<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

:root {
  --df: 'Outfit', sans-serif;
  --db: 'Plus Jakarta Sans', sans-serif;
  --dr: 16px;
  --dlg: 22px;
  --dxl: 28px;
  --dg: 16px;
}

.dp { font-family: var(--db); padding-bottom: 48px; max-width: 1280px; width:100%; overflow-x:hidden; }
@media(max-width:640px){ .dp{ padding-left:2px;padding-right:2px; } }

/* ── Announcement ── */
.da { display:flex;align-items:center;gap:12px;padding:11px 16px;background:linear-gradient(100deg,rgba(99,102,241,.10),rgba(168,85,247,.06));border:1px solid rgba(99,102,241,.22);border-radius:var(--dr);margin-bottom:14px;animation:drise .4s ease both; }
.da-hi .da-t { color:#fbbf24; }
.da-t { font-size:13px;font-weight:700;color:var(--text-primary); }
.da-b { font-size:12px;color:var(--text-secondary);margin-left:8px; }

/* ── Greeting hero (with XP bar built in) ── */
.dgr { background:var(--bg-card);border:1px solid var(--border);border-radius:var(--dxl);
  padding:24px 28px;margin-bottom:var(--dg);position:relative;overflow:hidden;animation:drise .45s ease both; }
.dgr::before { content:'';position:absolute;top:-70px;right:-70px;width:240px;height:240px;
  background:radial-gradient(circle,rgba(99,102,241,.14) 0%,transparent 70%);pointer-events:none; }
.dgr-top { display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;position:relative;z-index:1; }
.dgr-left { display:flex;align-items:center;gap:16px;min-width:0; }
.dgr-av { width:56px;height:56px;border-radius:16px;flex-shrink:0;overflow:hidden;
  background:linear-gradient(135deg,#6366f1,#a855f7);display:flex;align-items:center;justify-content:center;
  font-family:var(--df);font-size:22px;font-weight:800;color:#fff;box-shadow:0 8px 24px rgba(99,102,241,.3); }
.dgr-av img { width:100%;height:100%;object-fit:cover; }
.dgr-hi { font-family:var(--df);font-size:23px;font-weight:800;color:var(--text-primary);letter-spacing:-.4px;line-height:1.2;word-break:break-word; }
.dgr-hi span { background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
.dgr-sub { font-size:13px;color:var(--text-muted);margin-top:3px;font-weight:500; }
.dgr-actions { display:flex;gap:10px;flex-shrink:0; }
.dgr-btn { display:inline-flex;align-items:center;gap:7px;padding:11px 18px;border-radius:12px;font-family:var(--db);
  font-size:13.5px;font-weight:700;text-decoration:none;transition:transform .16s,opacity .16s;white-space:nowrap; }
.dgr-btn:hover { transform:translateY(-2px); }
.dgr-btn.primary { background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;box-shadow:0 8px 22px rgba(99,102,241,.28); }
.dgr-btn.secondary { background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border); }
.dgr-btn.primary{
  position:relative;
  overflow:hidden;
  animation:dgrPrimaryPulse 2.7s ease-in-out infinite;
}
.dgr-btn.primary::before{
  content:'';
  position:absolute;
  top:0;bottom:0;left:-120%;
  width:65%;
  background:linear-gradient(100deg,transparent,rgba(255,255,255,.22),transparent);
  transform:skewX(-18deg);
  animation:dgrPrimaryShine 3.4s ease-in-out infinite;
  pointer-events:none;
}
.dgr-btn.primary svg{
  position:relative;z-index:1;
  animation:dgrPlayBounce 2.2s ease-in-out infinite;
}
.dgr-btn.secondary{
  position:relative;
  overflow:hidden;
  animation:dgrSecondaryPulse 3s ease-in-out infinite;
}
.dgr-btn.secondary::before{
  content:'';
  position:absolute;
  top:0;bottom:0;left:-120%;
  width:60%;
  background:linear-gradient(100deg,transparent,rgba(255,255,255,.10),transparent);
  transform:skewX(-18deg);
  animation:dgrSecondaryShine 4s ease-in-out infinite;
  pointer-events:none;
}
.dgr-btn.secondary svg{
  position:relative;z-index:1;
  animation:dgrCalendarFloat 2.8s ease-in-out infinite;
}
.dgr-btn.primary:hover,.dgr-btn.secondary:hover{
  transform:translateY(-3px);
}
@keyframes dgrPrimaryShine{
  0%,58%{left:-120%} 78%,100%{left:145%}
}
@keyframes dgrSecondaryShine{
  0%,62%{left:-120%} 82%,100%{left:145%}
}
@keyframes dgrPrimaryPulse{
  0%,100%{box-shadow:0 8px 22px rgba(99,102,241,.28)}
  50%{box-shadow:0 11px 29px rgba(168,85,247,.38)}
}
@keyframes dgrSecondaryPulse{
  0%,100%{box-shadow:0 0 0 rgba(99,102,241,0)}
  50%{box-shadow:0 7px 20px rgba(99,102,241,.10)}
}
@keyframes dgrPlayBounce{
  0%,100%{transform:translateX(0)}
  35%{transform:translateX(2px)}
  50%{transform:translateX(0)}
}
@keyframes dgrCalendarFloat{
  0%,100%{transform:translateY(0) rotate(0)}
  45%{transform:translateY(-1px) rotate(-3deg)}
}
.dgr-btn.telegram {
  position:relative;
  overflow:hidden;
  background:linear-gradient(135deg,#229ed9,#168ac0);
  color:#fff;
  border:1px solid rgba(125,211,252,.34);
  box-shadow:0 8px 22px rgba(34,158,217,.22);
}
.dgr-btn.telegram::before {
  content:'';
  position:absolute;
  inset:0;
  left:-120%;
  width:70%;
  background:linear-gradient(100deg,transparent,rgba(255,255,255,.24),transparent);
  transform:skewX(-18deg);
  animation:dgrTelegramShine 3.2s ease-in-out infinite;
  pointer-events:none;
}
.dgr-btn.telegram svg{
  width:14px;height:14px;flex:0 0 auto;
  position:relative;z-index:1;
  animation:dgrTelegramIcon 2.4s ease-in-out infinite;
}
.dgr-btn.telegram{animation:dgrTelegramPulse 2.8s ease-in-out infinite;}
.dgr-btn.telegram:hover {
  background:linear-gradient(135deg,#25a7e0,#168ac0);
  color:#fff;
  border-color:rgba(125,211,252,.52);
  box-shadow:0 11px 28px rgba(34,158,217,.32);
}
.dgr-btn.telegram:hover svg{animation-play-state:paused}
@keyframes dgrTelegramShine{
  0%,55%{left:-120%}
  75%,100%{left:145%}
}
@keyframes dgrTelegramIcon{
  0%,100%{transform:translate(0,0) rotate(0)}
  35%{transform:translate(1px,-1px) rotate(-5deg)}
  55%{transform:translate(2px,-2px) rotate(2deg)}
}
@keyframes dgrTelegramPulse{
  0%,100%{box-shadow:0 8px 22px rgba(34,158,217,.22)}
  50%{box-shadow:0 10px 28px rgba(34,158,217,.34)}
}

/* XP strip inside the hero card */
.dgr-xp { position:relative;z-index:1;margin-top:20px;padding-top:16px;border-top:1px solid var(--border); }
.dxp-top { display:flex;justify-content:space-between;align-items:baseline;margin-bottom:9px;gap:10px;flex-wrap:wrap; }
.dxp-lv { font-family:var(--df);font-size:13.5px;font-weight:700;color:var(--text-primary); }
.dxp-lv em { font-style:normal;color:var(--accent); }
.dxp-n { font-size:12px;color:var(--text-muted);font-weight:600; }
.dxp-track { height:8px;background:var(--bg-secondary);border-radius:99px;overflow:hidden; }
.dxp-fill { height:100%;border-radius:99px;background:linear-gradient(90deg,#6366f1,#a855f7);transition:width 1s cubic-bezier(.4,0,.2,1); }

@media(max-width:640px){
  .dgr{padding:18px;}
  .dgr-top{flex-direction:column;align-items:stretch;gap:16px;}
  .dgr-left{gap:12px;}
  .dgr-av{width:48px;height:48px;font-size:19px;border-radius:14px;}
  .dgr-hi{font-size:18px;}
  .dgr-sub{font-size:12px;white-space:normal;word-break:break-word;}
  .dgr-actions{width:100%;flex-wrap:wrap;}
  .dgr-btn{flex:1 1 0;justify-content:center;padding:11px 10px;font-size:12.5px;min-width:0;}
  .dgr-btn.telegram{flex:0 0 100%;width:100%;}
  .dxp-top{gap:4px;}
  .dxp-n{font-size:11px;}
}
@media(max-width:380px){
  .dgr{padding:14px;}
  .dgr-hi{font-size:16.5px;}
  .dgr-actions{flex-direction:row;flex-wrap:wrap;}
  .dgr-actions .dgr-btn:not(.telegram){flex:1 1 0;}
  .dgr-btn.telegram{flex:0 0 100%;}
}

/* ── Hero ── */
.dh { display:grid;grid-template-columns:1fr auto;gap:var(--dg);margin-bottom:var(--dg);align-items:stretch; }
@media(max-width:720px){.dh{grid-template-columns:1fr;}}

.dclk {
  background:var(--bg-card);border:1px solid var(--border);border-radius:var(--dxl);
  padding:26px 30px;position:relative;overflow:hidden;animation:drise .5s .05s ease both;
}
.dclk::before {
  content:'';position:absolute;top:-60px;left:-60px;width:220px;height:220px;
  background:radial-gradient(circle,rgba(99,102,241,.16) 0%,transparent 70%);pointer-events:none;
}
.dclk-day  { font-family:var(--df);font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--accent);margin-bottom:4px; }
.dclk-date { font-family:var(--df);font-size:30px;font-weight:800;color:var(--text-primary);line-height:1.1;letter-spacing:-.5px; }
.dclk-tr   { display:flex;align-items:baseline;gap:8px;margin-top:14px; }
.dclk-time { font-family:var(--df);font-size:50px;font-weight:900;letter-spacing:-3px;line-height:1;background:linear-gradient(135deg,#818cf8 0%,#c084fc 50%,#38bdf8 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-variant-numeric:tabular-nums; }
.dclk-ap   { font-family:var(--df);font-size:13px;font-weight:700;color:var(--text-muted);letter-spacing:2px;text-transform:uppercase;padding-bottom:6px; }

/* ── Floating study icons ── */
.dclk-icons {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: var(--dxl);
}
.sci {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  font-size: 18px;
  backdrop-filter: blur(2px);
  animation: sci-float linear infinite;
  opacity: 0;
}
/* individual icons — position, size, timing */
.sci-1  { width:42px;height:42px; top:8%;  right:12%; background:rgba(99,102,241,.10); border:1px solid rgba(99,102,241,.18); animation-duration:7s;  animation-delay:0s;   font-size:20px; }
.sci-2  { width:36px;height:36px; top:55%; right:6%;  background:rgba(168,85,247,.09); border:1px solid rgba(168,85,247,.16); animation-duration:9s;  animation-delay:1.2s; font-size:17px; }
.sci-3  { width:38px;height:38px; top:22%; right:30%; background:rgba(6,182,212,.08);  border:1px solid rgba(6,182,212,.15);  animation-duration:8s;  animation-delay:2.5s; font-size:18px; }
.sci-4  { width:32px;height:32px; top:70%; right:22%; background:rgba(245,158,11,.08); border:1px solid rgba(245,158,11,.15); animation-duration:10s; animation-delay:0.8s; font-size:15px; }
.sci-5  { width:44px;height:44px; top:5%;  right:50%; background:rgba(16,185,129,.08); border:1px solid rgba(16,185,129,.15); animation-duration:11s; animation-delay:3.5s; font-size:21px; }
.sci-6  { width:34px;height:34px; top:78%; right:40%; background:rgba(239,68,68,.07);  border:1px solid rgba(239,68,68,.14);  animation-duration:8.5s;animation-delay:1.8s; font-size:16px; }
.sci-7  { width:38px;height:38px; top:40%; right:14%; background:rgba(99,102,241,.08); border:1px solid rgba(99,102,241,.14); animation-duration:9.5s;animation-delay:4.2s; font-size:18px; }
.sci-8  { width:30px;height:30px; top:15%; right:44%; background:rgba(168,85,247,.07); border:1px solid rgba(168,85,247,.13); animation-duration:7.5s;animation-delay:2.0s; font-size:14px; }

/* Light mode: more subtle */
[data-theme="light"] .sci { opacity: 0; }
[data-theme="light"] .sci-1  { background:rgba(99,102,241,.06);  border-color:rgba(99,102,241,.12);  }
[data-theme="light"] .sci-2  { background:rgba(168,85,247,.05);  border-color:rgba(168,85,247,.1);   }
[data-theme="light"] .sci-3  { background:rgba(6,182,212,.05);   border-color:rgba(6,182,212,.1);    }
[data-theme="light"] .sci-4  { background:rgba(245,158,11,.05);  border-color:rgba(245,158,11,.1);   }
[data-theme="light"] .sci-5  { background:rgba(16,185,129,.05);  border-color:rgba(16,185,129,.1);   }
[data-theme="light"] .sci-6  { background:rgba(239,68,68,.04);   border-color:rgba(239,68,68,.08);   }
[data-theme="light"] .sci-7  { background:rgba(99,102,241,.05);  border-color:rgba(99,102,241,.1);   }
[data-theme="light"] .sci-8  { background:rgba(168,85,247,.04);  border-color:rgba(168,85,247,.08);  }

@keyframes sci-float {
  0%   { transform: translateY(0px)   rotate(0deg)   scale(0.9);  opacity: 0;   }
  8%   { opacity: 0.75; }
  45%  { transform: translateY(-18px) rotate(6deg)   scale(1.06); opacity: 0.8; }
  55%  { transform: translateY(-22px) rotate(-4deg)  scale(1.04); opacity: 0.75;}
  92%  { opacity: 0.65; }
  100% { transform: translateY(-8px)  rotate(2deg)   scale(0.95); opacity: 0;   }
}
/* each icon gets a slightly different drift pattern */
.sci-1 { animation-name: sci-float-a; }
.sci-3 { animation-name: sci-float-b; }
.sci-5 { animation-name: sci-float-c; }
.sci-7 { animation-name: sci-float-b; }

@keyframes sci-float-a {
  0%   { transform: translateY(0px)   rotate(-3deg)  scale(0.88); opacity: 0;   }
  10%  { opacity: 0.8; }
  50%  { transform: translateY(-16px) rotate(8deg)   scale(1.08); opacity: 0.85;}
  90%  { opacity: 0.7; }
  100% { transform: translateY(-6px)  rotate(-2deg)  scale(0.92); opacity: 0;   }
}
@keyframes sci-float-b {
  0%   { transform: translate(0px, 0px)    scale(0.9);  opacity: 0;   }
  12%  { opacity: 0.7; }
  40%  { transform: translate(-8px,-20px)  scale(1.05); opacity: 0.78;}
  60%  { transform: translate(6px, -14px)  scale(1.02); opacity: 0.72;}
  88%  { opacity: 0.6; }
  100% { transform: translate(0px, -5px)   scale(0.94); opacity: 0;   }
}
@keyframes sci-float-c {
  0%   { transform: translateY(0)    rotate(0)      scale(1);    opacity: 0;   }
  6%   { opacity: 0.9; }
  35%  { transform: translateY(-24px) rotate(-10deg) scale(1.1);  opacity: 0.88;}
  65%  { transform: translateY(-12px) rotate(5deg)   scale(1.03); opacity: 0.8; }
  94%  { opacity: 0.6; }
  100% { transform: translateY(-4px)  rotate(-3deg)  scale(0.95); opacity: 0;   }
}

.dcd {
  background:var(--bg-card);border:1px solid rgba(99,102,241,.28);border-radius:var(--dxl);
  padding:26px 26px;min-width:220px;width:100%;flex:0 0 100%;position:relative;overflow:hidden;box-sizing:border-box;
  display:flex;flex-direction:column;justify-content:space-between;animation:drise .5s .1s ease both;
}
.dcd::after { content:'';position:absolute;bottom:-40px;right:-40px;width:160px;height:160px;background:radial-gradient(circle,rgba(168,85,247,.12),transparent 70%);pointer-events:none; }
.dcd-chip { display:inline-flex;align-items:center;gap:6px;background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.2);border-radius:99px;padding:4px 12px;font-size:11px;font-weight:700;color:var(--accent);letter-spacing:.5px;text-transform:uppercase;width:fit-content;margin-bottom:12px; }
.dcd-nm { font-family:var(--df);font-size:15px;font-weight:700;color:var(--text-primary);line-height:1.3;margin-bottom:3px; }
.dcd-dt { font-size:12px;color:var(--text-muted);margin-bottom:16px; }
/* ── Countdown floating icons ── */
.dcd-icons { position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:var(--dxl); }
.cdi {
  position:absolute;
  display:flex;align-items:center;justify-content:center;
  border-radius:11px;
  animation:cdi-drift linear infinite;
  opacity:0;
}
.cdi-1 { width:34px;height:34px; top:6%;  right:8%;  background:rgba(99,102,241,.1); border:1px solid rgba(99,102,241,.2);  font-size:16px; animation-duration:8s;  animation-delay:0s;   }
.cdi-2 { width:28px;height:28px; top:50%; right:5%;  background:rgba(168,85,247,.09);border:1px solid rgba(168,85,247,.18); font-size:13px; animation-duration:10s; animation-delay:1.5s; }
.cdi-3 { width:32px;height:32px; top:75%; right:14%; background:rgba(6,182,212,.08); border:1px solid rgba(6,182,212,.16);  font-size:15px; animation-duration:7.5s;animation-delay:3.2s; }
.cdi-4 { width:26px;height:26px; top:18%; right:38%; background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.15); font-size:12px; animation-duration:9s;  animation-delay:0.6s; }
.cdi-5 { width:30px;height:30px; top:60%; right:30%; background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.15); font-size:14px; animation-duration:11s; animation-delay:2.8s; }
[data-theme="light"] .cdi-1{background:rgba(99,102,241,.06);border-color:rgba(99,102,241,.12);}
[data-theme="light"] .cdi-2{background:rgba(168,85,247,.05);border-color:rgba(168,85,247,.1);}
[data-theme="light"] .cdi-3{background:rgba(6,182,212,.05);border-color:rgba(6,182,212,.1);}
[data-theme="light"] .cdi-4{background:rgba(245,158,11,.05);border-color:rgba(245,158,11,.1);}
[data-theme="light"] .cdi-5{background:rgba(16,185,129,.05);border-color:rgba(16,185,129,.1);}
@keyframes cdi-drift {
  0%   { transform:translate(0,0)        rotate(0deg)   scale(.88); opacity:0;    }
  10%  { opacity:.75; }
  40%  { transform:translate(-4px,-16px) rotate(-8deg)  scale(1.06); opacity:.82; }
  60%  { transform:translate(3px,-20px)  rotate(5deg)   scale(1.03); opacity:.75; }
  90%  { opacity:.55; }
  100% { transform:translate(-1px,-7px)  rotate(-2deg)  scale(.92); opacity:0;   }
}
.dcd-units { display:flex;gap:10px; }
.dcd-unit { flex:1;background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--dr);padding:12px 8px 8px;text-align:center; }
.dcd-n { font-family:var(--df);font-size:30px;font-weight:900;line-height:1;background:linear-gradient(135deg,#6366f1,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-1px;display:block; }
.dcd-l { font-size:9px;font-weight:700;color:var(--text-muted);letter-spacing:1.5px;text-transform:uppercase;margin-top:4px;display:block; }
.dcd-wrap { display:flex;flex-direction:column;min-width:220px;max-width:100%;overflow:hidden; }
.dcd-track { display:flex;transition:transform .38s cubic-bezier(.4,0,.2,1);will-change:transform;cursor:grab;user-select:none; }
.dcd-track.dragging { cursor:grabbing;transition:none; }
.dcd-dots { display:flex;justify-content:center;gap:6px;padding:10px 0 2px; }
.dcd-dot { width:6px;height:6px;border-radius:99px;border:none;padding:0;cursor:pointer;background:var(--border);transition:all .25s ease; }
.dcd-dot.active { width:18px;background:var(--accent); }
/* ── Flip Card ── */
.dcd-flip-wrapper {
  position: relative;
  height: 90px;
  perspective: 800px;
  cursor: pointer;
  margin-top: 4px;
}
.dcd-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transition: transform 0.55s cubic-bezier(0.34, 1.1, 0.64, 1);
  transform-style: preserve-3d;
}
.dcd-front {
  transform: rotateY(0deg);
}
.dcd-back {
  transform: rotateY(180deg);
}
.dcd-flip-wrapper.flipped .dcd-front {
  transform: rotateY(-180deg);
}
.dcd-flip-wrapper.flipped .dcd-back {
  transform: rotateY(0deg);
}
.dcd-units-detailed {
  gap: 6px !important;
}
.dcd-unit-sm {
  padding: 8px 4px 6px !important;
}
.dcd-unit-sm .dcd-n {
  font-size: 22px !important;
  letter-spacing: -0.5px !important;
}
.dcd-unit-sm .dcd-l {
  font-size: 8px !important;
}
.dcd-flip-hint {
  font-size: 10px;
  color: var(--text-muted);
  text-align: center;
  margin-top: 6px;
  opacity: 0.6;
  letter-spacing: 0.3px;
  transition: opacity 0.2s;
}
.dcd-flip-wrapper:hover .dcd-flip-hint {
  opacity: 1;
  color: var(--accent);
}

/* Flip number animation - digit slots */
.dcd-digit-slot {
  display: inline-block;
  position: relative;
  overflow: hidden;
  height: 1.15em;
  vertical-align: top;
}
.dcd-digit-slot span {
  display: block;
  transition: transform 0.22s cubic-bezier(0.34, 1.3, 0.64, 1), opacity 0.18s ease;
}
.dcd-digit-slot.tick span {
  animation: digit-tick 0.22s cubic-bezier(0.34, 1.2, 0.64, 1);
}
@keyframes digit-tick {
  0%   { transform: translateY(-60%) scale(0.85); opacity: 0.3; }
  60%  { transform: translateY(8%) scale(1.06);  opacity: 1; }
  100% { transform: translateY(0)  scale(1);     opacity: 1; }
}



/* ── Quick Actions ── */


/* ── Stats ── */
.dstats { display:grid;grid-template-columns:repeat(3,1fr);gap:var(--dg);margin-bottom:var(--dg); }
@media(max-width:900px){.dstats{grid-template-columns:repeat(2,1fr);}}

.dst { background:var(--bg-card);border:1px solid var(--border);border-radius:var(--dlg);padding:22px 22px 18px;position:relative;overflow:hidden;transition:transform .2s,box-shadow .2s,border-color .2s;animation:drise .5s ease both;cursor:default; }
.dst:nth-child(1){animation-delay:.12s} .dst:nth-child(2){animation-delay:.17s} .dst:nth-child(3){animation-delay:.22s} .dst:nth-child(4){animation-delay:.27s} .dst:nth-child(5){animation-delay:.32s} .dst:nth-child(6){animation-delay:.37s}
.dst:hover { transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.2);border-color:var(--border-light); }
a.dst { display:block;text-decoration:none;cursor:pointer; }
.dst::before { content:'';position:absolute;width:120px;height:120px;border-radius:50%;top:-30px;right:-30px;pointer-events:none; }
.dst1::before{background:rgba(99,102,241,.16)} .dst2::before{background:rgba(6,182,212,.14)} .dst3::before{background:rgba(245,158,11,.14)} .dst4::before{background:rgba(16,185,129,.14)} .dst5::before{background:rgba(236,72,153,.14)} .dst6::before{background:rgba(168,85,247,.14)}
.dst::after { content:'';position:absolute;bottom:0;left:0;right:0;height:2px;opacity:0;transition:opacity .2s; }
.dst:hover::after{opacity:1}
.dst1::after{background:linear-gradient(90deg,#6366f1,#a855f7)} .dst2::after{background:linear-gradient(90deg,#06b6d4,#6366f1)} .dst3::after{background:linear-gradient(90deg,#f59e0b,#ef4444)} .dst4::after{background:linear-gradient(90deg,#10b981,#06b6d4)} .dst5::after{background:linear-gradient(90deg,#ec4899,#f43f5e)} .dst6::after{background:linear-gradient(90deg,#a855f7,#6366f1)}

.dsth { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px; }
.dsti { width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:19px; }
.dsttag { font-size:11px;font-weight:700;padding:3px 9px;border-radius:99px; }
.tg { background:rgba(16,185,129,.12);color:#10b981; } .ta { background:rgba(245,158,11,.12);color:#f59e0b; } .tr { background:rgba(239,68,68,.12);color:#ef4444; } .tc { background:rgba(6,182,212,.12);color:#06b6d4; }

.dstv { font-family:var(--df);font-size:30px;font-weight:800;color:var(--text-primary);line-height:1;letter-spacing:-.5px; }
.dstv .du { font-size:14px;color:var(--text-muted);font-weight:500;font-family:var(--db); }
.dstl { font-size:12px;color:var(--text-muted);margin-top:6px;font-weight:500; }

/* ── Main grid ── */
.dmg { display:grid;grid-template-columns:1fr 330px;gap:var(--dg);margin-bottom:var(--dg);align-items:start; }
@media(max-width:960px){.dmg{grid-template-columns:1fr;}}

/* ── Card ── */
.dc { background:var(--bg-card);border:1px solid var(--border);border-radius:var(--dlg);padding:22px;animation:drise .5s .3s ease both; }
.dch { display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;gap:12px; }
.dct { font-family:var(--df);font-size:15px;font-weight:700;color:var(--text-primary);letter-spacing:-.2px; }
.dcl { font-size:12px;font-weight:600;color:var(--accent);text-decoration:none;padding:5px 12px;border-radius:8px;border:1px solid rgba(99,102,241,.25);transition:all .16s;flex-shrink:0;white-space:nowrap; }
.dcl:hover { background:rgba(99,102,241,.1);border-color:rgba(99,102,241,.4); }

.dptgl { display:flex;background:var(--bg-secondary);border-radius:9px;padding:3px;gap:2px; }
.dptb { padding:5px 13px;border-radius:7px;border:none;font-family:var(--db);font-size:12px;font-weight:600;cursor:pointer;background:transparent;color:var(--text-muted);transition:all .16s; }
.dptb.active { background:var(--bg-card);color:var(--text-primary);box-shadow:0 1px 4px rgba(0,0,0,.18); }
.dchw { height:210px; }

.dsr { margin-bottom:14px; }
.dsi { display:flex;justify-content:space-between;align-items:center;margin-bottom:7px; }
.dsn { font-size:13px;color:var(--text-primary);font-weight:500;display:flex;align-items:center;gap:8px; }
.dsdot { width:8px;height:8px;border-radius:50%;flex-shrink:0; }
.dst_ { font-size:12px;color:var(--text-muted);font-weight:600; }
.dpr { height:5px;background:var(--bg-secondary);border-radius:99px;overflow:hidden; }
.dprb { height:100%;border-radius:99px;transition:width 1s cubic-bezier(.4,0,.2,1); }

/* ── Table grid ── */
.dtg { display:grid;grid-template-columns:1fr 1fr;gap:var(--dg);margin-bottom:var(--dg); }
@media(max-width:860px){.dtg{grid-template-columns:1fr;}}

/* Shared dot + badge styles */
.dinl { display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:7px;vertical-align:middle;flex-shrink:0; }
.dsc { padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;display:inline-block;white-space:nowrap; }
.dsca{background:rgba(16,185,129,.12);color:#10b981;} .dscb{background:rgba(245,158,11,.12);color:#f59e0b;} .dscc{background:rgba(239,68,68,.12);color:#ef4444;}
.ddur { font-weight:700;color:var(--accent);font-size:13px;white-space:nowrap; }

/* Desktop header row */
.drow-hd {
  display:grid;
  grid-template-columns:80px 1fr 80px;
  gap:8px;
  padding:0 0 10px;
  border-bottom:1px solid var(--border);
  font-size:11px;
  font-weight:700;
  color:var(--text-muted);
  text-transform:uppercase;
  letter-spacing:.8px;
}
/* Data row */
.drow {
  display:grid;
  grid-template-columns:80px 1fr 80px;
  gap:8px;
  padding:10px 0;
  border-bottom:1px solid var(--border);
  align-items:center;
}
.drow:last-child { border-bottom:none; }
.drow-date {
  font-size:12px;
  color:var(--text-muted);
  white-space:nowrap;
}
.drow-subj {
  font-size:13px;
  color:var(--text-primary);
  display:flex;
  align-items:center;
  overflow:hidden;
  white-space:nowrap;
  text-overflow:ellipsis;
}
.drow-val {
  text-align:right;
}

/* ── Mobile: card layout ── */
@media(max-width:600px){
  .drow-hd { display:none; }
  .drow {
    display:grid;
    grid-template-columns:1fr auto;
    grid-template-rows:auto auto;
    grid-template-areas:
      "date  val"
      "subj  val";
    gap:3px 12px;
    background:var(--bg-secondary);
    border:1px solid var(--border) !important;
    border-radius:12px;
    padding:12px 14px;
    margin-bottom:8px;
  }
  .drow:last-child { margin-bottom:0; border-bottom:1px solid var(--border) !important; }
  .drow-date {
    grid-area:date;
    font-size:11px;
    font-weight:700;
    color:var(--text-muted);
    letter-spacing:.5px;
    text-transform:uppercase;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }
  .drow-subj {
    grid-area:subj;
    font-size:14px;
    font-weight:600;
    color:var(--text-primary);
  }
  .drow-val {
    grid-area:val;
    display:flex;
    align-items:center;
    justify-content:flex-end;
    text-align:right;
  }
}

/* ── Targets ── */
.dtr_ { display:flex;justify-content:space-between;align-items:center;margin-bottom:7px; }
.dtnm { display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--text-primary); }
.dtdc { background:rgba(16,185,129,.12);color:#10b981;font-size:10px;padding:2px 8px;border-radius:99px;font-weight:700; }
.dtt  { font-size:12px;color:var(--text-muted);font-weight:500; }
.dtt.done { color:#10b981;font-weight:700; }
.dti  { margin-bottom:16px; }
.dti:last-child{margin-bottom:0;}

/* ── Performers ── */
.dp3g { display:grid;grid-template-columns:repeat(3,1fr);gap:14px; }
@media(max-width:720px){.dp3g{grid-template-columns:1fr;}}

.dprf { background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--dlg);padding:20px 16px 16px;text-align:center;position:relative;overflow:hidden;transition:transform .2s,box-shadow .2s; }
.dprf:hover{transform:translateY(-5px);}
.dprf::before { content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% -10%,var(--dpg,rgba(99,102,241,.08)) 0%,transparent 65%);pointer-events:none; }
.dmdl { position:absolute;top:10px;left:12px;font-size:20px; }
.dpav { width:54px;height:54px;border-radius:50%;border:2.5px solid var(--dpc,#6366f1);background:var(--dpb,rgba(99,102,241,.1));display:flex;align-items:center;justify-content:center;font-size:21px;font-weight:800;color:var(--dpc,#6366f1);margin:0 auto 12px;overflow:hidden; }
.dpav img { width:100%;height:100%;object-fit:cover; }
.dpnm { font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.dpst { background:var(--bg-card);border-radius:9px;padding:7px 10px;display:flex;justify-content:space-between;align-items:center;margin-bottom:6px; }
.dpst:last-child{margin-bottom:0;}
.dpsl{font-size:11px;color:var(--text-muted);} .dpsv{font-size:13px;font-weight:700;color:var(--text-primary);}

/* ── Empty ── */
.dempty { text-align:center;padding:28px 20px; }
.dei { font-size:34px;margin-bottom:10px; }
.dempty h3 { font-size:14px;font-weight:600;color:var(--text-secondary);margin-bottom:4px; }
.dempty p { font-size:12px;color:var(--text-muted); }

/* ── Animations ── */
@keyframes drise { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }

/* ══════════════════════════════════════════════
   TUTORIAL BANNER
══════════════════════════════════════════════ */
.tutorial-banner {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 18px;
  background: linear-gradient(110deg, rgba(99,102,241,.13) 0%, rgba(139,92,246,.09) 50%, rgba(6,182,212,.07) 100%);
  border: 1px solid rgba(99,102,241,.3);
  border-radius: var(--dr);
  margin-bottom: 16px;
  animation: drise .45s ease both;
  position: relative;
  overflow: hidden;
}
.tutorial-banner::before {
  content: '';
  position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: linear-gradient(180deg, #6366f1, #8b5cf6, #06b6d4);
  border-radius: 3px 0 0 3px;
}
.tutorial-banner-icon {
  font-size: 26px; flex-shrink: 0;
  filter: drop-shadow(0 0 8px rgba(99,102,241,.5));
}
.tutorial-banner-body { flex: 1; min-width: 0; }
.tutorial-banner-title {
  font-size: 13px; font-weight: 700; color: var(--text-primary);
  display: flex; align-items: center; gap: 7px; margin-bottom: 3px;
}
.tutorial-banner-title .tut-badge {
  font-size: 10px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase;
  padding: 2px 7px; border-radius: 20px;
  background: rgba(99,102,241,.2); color: #818cf8; border: 1px solid rgba(99,102,241,.3);
}
.tutorial-banner-sub {
  font-size: 12px; color: var(--text-secondary); line-height: 1.5;
}
.tutorial-banner-actions {
  display: flex; align-items: center; gap: 8px; flex-shrink: 0;
}
.tut-btn-go {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 7px 14px; border-radius: 8px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff; font-size: 12px; font-weight: 700;
  text-decoration: none; border: none; cursor: pointer;
  transition: opacity .2s, transform .2s, box-shadow .2s;
  box-shadow: 0 4px 14px rgba(99,102,241,.35);
  white-space: nowrap;
}
.tut-btn-go:hover { opacity: .9; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,.4); }
.tut-btn-close {
  width: 30px; height: 30px; border-radius: 8px; border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.04); color: var(--text-secondary);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background .2s, color .2s;
  flex-shrink: 0;
}
.tut-btn-close:hover { background: rgba(255,255,255,.1); color: var(--text-primary); }
@media (max-width: 600px) {
  .tutorial-banner { flex-wrap: wrap; gap: 10px; }
  .tutorial-banner-actions { width: 100%; justify-content: flex-end; }
}

/* ══════════════════════════════════════════════
   TELEGRAM CHANNEL BANNER
══════════════════════════════════════════════ */
.tg-banner {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 18px;
  background: linear-gradient(110deg, rgba(38,165,228,.14) 0%, rgba(38,165,228,.07) 60%, rgba(99,102,241,.06) 100%);
  border: 1px solid rgba(38,165,228,.32);
  border-radius: var(--dr);
  margin-bottom: 16px;
  animation: drise .45s .03s ease both;
  position: relative;
  overflow: hidden;
}
.tg-banner::before {
  content: '';
  position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
  background: linear-gradient(180deg, #29b6f6, #26A5E4, #1e88c7);
  border-radius: 3px 0 0 3px;
}
.tg-banner-icon {
  width: 34px; height: 34px; flex-shrink: 0;
  filter: drop-shadow(0 0 8px rgba(38,165,228,.5));
}
.tg-banner-body { flex: 1; min-width: 0; }
.tg-banner-title {
  font-size: 13px; font-weight: 700; color: var(--text-primary);
  display: flex; align-items: center; gap: 7px; margin-bottom: 3px;
}
.tg-banner-title .tg-badge {
  font-size: 10px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase;
  padding: 2px 7px; border-radius: 20px;
  background: rgba(38,165,228,.18); color: #4fc3f7; border: 1px solid rgba(38,165,228,.35);
}
.tg-banner-sub {
  font-size: 12px; color: var(--text-secondary); line-height: 1.5;
}
.tg-banner-actions {
  display: flex; align-items: center; gap: 8px; flex-shrink: 0;
}
.tg-btn-go {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 8px;
  background: linear-gradient(135deg, #26A5E4, #1e88c7);
  color: #fff; font-size: 12px; font-weight: 700;
  text-decoration: none; border: none; cursor: pointer;
  transition: opacity .2s, transform .2s, box-shadow .2s;
  box-shadow: 0 4px 14px rgba(38,165,228,.35);
  white-space: nowrap;
}
.tg-btn-go:hover { opacity: .9; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(38,165,228,.4); }
.tg-btn-close {
  width: 30px; height: 30px; border-radius: 8px; border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.04); color: var(--text-secondary);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background .2s, color .2s;
  flex-shrink: 0;
}
.tg-btn-close:hover { background: rgba(255,255,255,.1); color: var(--text-primary); }
@media (max-width: 600px) {
  .tg-banner { flex-wrap: wrap; gap: 10px; }
  .tg-banner-actions { width: 100%; justify-content: flex-end; }
}
</style>

<div class="dp">
`;
if(!PHP.empty(announcements)){
for(var a1=PHP.arr(announcements),i_a1=0,ann;i_a1<a1.length&&((ann=a1[i_a1]),true);i_a1++){
o+=`
<div class="da `;
o+=PHP.s(ann['priority']==='high' ? 'da-hi' : '');
o+=`">
  <span style="font-size:17px;flex-shrink:0">`;
o+=PHP.s(ann['priority']==='high' ? '🔔' : '📌');
o+=`</span>
  <div><span class="da-t">`;
o+=PHP.s(E(ann['title']));
o+=`</span><span class="da-b">`;
o+=PHP.s(E(ann['content']));
o+=`</span></div>
</div>
`;
}
}
o+=`

<!-- GREETING HERO (with XP built in) -->
<div class="dgr">
  <div class="dgr-top">
    <div class="dgr-left">
      <div class="dgr-av">
        `;
if(PHP.T(greetAvatar)){
o+=`<img src="`;
o+=PHP.s(E(greetAvatar));
o+=`" alt="">`;
}else{
o+=PHP.s(E(greetInitial));
}
o+=`
      </div>
      <div>
        <div class="dgr-hi">Good `;
o+=PHP.s(greetTime);
o+=`, <span>`;
o+=PHP.s(E(greetName));
o+=`.</span></div>
        <div class="dgr-sub">Level `;
o+=PHP.s(greetLevel);
o+=` Scholar · `;
o+=PHP.s(totalSessionsAll);
o+=` session`;
o+=PHP.s(totalSessionsAll===1?'':'s');
o+=` · `;
o+=PHP.s(streak);
o+=`-day streak</div>
      </div>
    </div>
    <div class="dgr-actions">
      <a href="#/study-log" class="dgr-btn primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>
        Start Studying
      </a>
      <a href="#/timetable" class="dgr-btn secondary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Schedule
      </a>
      <a href="https://t.me/StudyTrackedurx_bot" target="_blank" rel="noopener noreferrer" class="dgr-btn telegram" title="Open StudyTrack Telegram Bot">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.2 4.6 18 19.7c-.24 1.08-.87 1.34-1.76.83l-4.87-3.59-2.35 2.26c-.26.26-.48.48-.98.48l.35-4.96 9.03-8.16c.39-.35-.09-.55-.61-.2L5.65 13.5.84 12c-1.05-.33-1.07-1.05.22-1.56L19.82 3.1c.87-.32 1.63.2 1.38 1.5Z"/></svg>
        Telegram Bot
      </a>
    </div>
  </div>
  <div class="dgr-xp">
    <div class="dxp-top">
      <div class="dxp-lv">Level `;
o+=PHP.s(greetLevel);
o+=` <em>Scholar</em></div>
      <div class="dxp-n">`;
o+=PHP.s(greetXpInLevel);
o+=` / 100 XP · `;
o+=PHP.s(100 - greetXpInLevel);
o+=` to Lv `;
o+=PHP.s(greetLevel + 1);
o+=`</div>
    </div>
    <div class="dxp-track"><div class="dxp-fill" style="width:`;
o+=PHP.s(greetXpInLevel);
o+=`%"></div></div>
  </div>
</div>

<!-- SMART FEATURES CENTER PROMO -->
<style>
.dsc{
  position:relative;display:flex;align-items:center;gap:18px;
  padding:22px 26px;margin-bottom:var(--dg);border-radius:var(--dlg);
  text-decoration:none;overflow:hidden;isolation:isolate;
  background:
    radial-gradient(120% 160% at 0% 0%,rgba(16,185,129,.20),transparent 55%),
    radial-gradient(120% 160% at 100% 100%,rgba(45,212,191,.18),transparent 55%),
    var(--bg-card);
  border:1px solid rgba(52,211,153,.32);
  animation:drise .5s .06s ease both, dscGlow 3.2s ease-in-out infinite;
  transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease;
}
.dsc:hover{transform:translateY(-3px);border-color:#34d399;box-shadow:0 16px 40px rgba(45,212,191,.24)}
.dsc-ic{
  position:relative;z-index:1;flex:0 0 auto;width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,#10b981,#2dd4bf);box-shadow:0 8px 20px rgba(16,185,129,.40);
  animation:dscFloat 2.6s ease-in-out infinite;
}
.dsc-ic svg{width:26px;height:26px}
.dsc-body{position:relative;z-index:1;flex:1;min-width:0}
.dsc-top{display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap}
.dsc-title{font-family:'Outfit',sans-serif;font-size:16.5px;font-weight:800;
  background:linear-gradient(100deg,#34d399,#2dd4bf,#34d399);background-size:200% auto;
  -webkit-background-clip:text;background-clip:text;color:transparent;
  animation:dscTitleShine 3.6s linear infinite;}
.dsc-new{font-size:9.5px;font-weight:850;letter-spacing:.7px;text-transform:uppercase;color:#062a20;
  padding:3px 9px;border-radius:99px;background:linear-gradient(100deg,#6ee7b7,#5eead4);
  animation:dscPulse 1.8s ease-in-out infinite}
.dsc-desc{position:relative;z-index:1;font-size:13px;line-height:1.5;color:var(--text-secondary);margin:0}
.dsc-arrow{position:relative;z-index:1;flex:0 0 auto;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  background:var(--bg-card);border:1px solid var(--border);color:var(--text-primary);font-size:16px;
  transition:transform .2s ease,background .2s ease}
.dsc:hover .dsc-arrow{transform:translateX(4px);background:linear-gradient(135deg,#10b981,#2dd4bf);color:#fff;border-color:transparent}
@keyframes dscFloat{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-5px) rotate(-4deg)}}
@keyframes dscPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.75;transform:scale(1.06)}}
@keyframes dscGlow{0%,100%{box-shadow:0 0 0 rgba(45,212,191,0)}50%{box-shadow:0 0 30px rgba(45,212,191,.20)}}
100%{left:130%}}
@keyframes dscTitleShine{to{background-position:200% center}}
@media(max-width:600px){.dsc{padding:18px}.dsc-desc{display:none}.dsc-arrow{display:none}}
</style>
<a href="`;
o+=PHP.s(SITE_URL);
o+=`/smart" class="dsc">
  <div class="dsc-ic"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/></svg></div>
  <div class="dsc-body">
    <div class="dsc-top">
      <span class="dsc-title">Smart Features Center</span>
      <span class="dsc-new">Now Open</span>
    </div>
    <p class="dsc-desc">Readiness score, marks predictor, deadline guard &amp; more — smart tools built from your own study data.</p>
  </div>
  <div class="dsc-arrow">→</div>
</a>

<!-- STUDY TOGETHER (STUDY ROOM) PROMO -->
<style>
.dsw{
  position:relative;display:flex;align-items:center;gap:18px;
  padding:22px 26px;margin-bottom:var(--dg);border-radius:var(--dlg);
  text-decoration:none;overflow:hidden;isolation:isolate;
  background:
    radial-gradient(120% 160% at 0% 0%,rgba(139,92,246,.22),transparent 55%),
    radial-gradient(120% 160% at 100% 100%,rgba(236,72,153,.18),transparent 55%),
    var(--bg-card);
  border:1px solid rgba(167,139,250,.38);
  animation:drise .5s .1s ease both, dswGlow 3.2s ease-in-out infinite;
  transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease;
}
.dsw:hover{transform:translateY(-3px);border-color:#a78bfa;box-shadow:0 16px 40px rgba(139,92,246,.28)}
.dsw-ic{
  position:relative;z-index:1;flex:0 0 auto;width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,#8b5cf6,#ec4899);box-shadow:0 8px 20px rgba(139,92,246,.42);
  animation:dswFloat 2.6s ease-in-out infinite;
}
.dsw-ic svg{width:26px;height:26px}
.dsw-body{position:relative;z-index:1;flex:1;min-width:0}
.dsw-top{display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap}
.dsw-title{font-family:'Outfit',sans-serif;font-size:16.5px;font-weight:800;
  background:linear-gradient(100deg,#a78bfa,#f472b6,#a78bfa);background-size:200% auto;
  -webkit-background-clip:text;background-clip:text;color:transparent;
  animation:dswTitleShine 3.6s linear infinite;}
.dsw-live{display:inline-flex;align-items:center;gap:6px;font-size:9.5px;font-weight:850;letter-spacing:.7px;text-transform:uppercase;color:#fff;
  padding:3px 10px 3px 8px;border-radius:99px;background:linear-gradient(100deg,#8b5cf6,#ec4899);}
.dsw-live i{width:6px;height:6px;border-radius:50%;background:#fff;display:inline-block;animation:dswDot 1.4s ease-in-out infinite}
.dsw-desc{position:relative;z-index:1;font-size:13px;line-height:1.5;color:var(--text-secondary);margin:0}
.dsw-cta{position:relative;z-index:1;flex:0 0 auto;display:inline-flex;align-items:center;gap:6px;padding:10px 16px;border-radius:12px;
  font-size:12.5px;font-weight:800;color:#fff;background:linear-gradient(135deg,#8b5cf6,#ec4899);box-shadow:0 8px 20px rgba(139,92,246,.32);
  transition:transform .2s ease,box-shadow .2s ease;white-space:nowrap}
.dsw:hover .dsw-cta{transform:translateX(3px);box-shadow:0 10px 26px rgba(236,72,153,.36)}
@keyframes dswFloat{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-5px) rotate(4deg)}}
@keyframes dswDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
@keyframes dswGlow{0%,100%{box-shadow:0 0 0 rgba(139,92,246,0)}50%{box-shadow:0 0 30px rgba(139,92,246,.22)}}
100%{left:130%}}
@keyframes dswTitleShine{to{background-position:200% center}}
@media(max-width:600px){.dsw{padding:18px;gap:14px}.dsw-desc{display:none}.dsw-cta{padding:9px 13px}}
</style>
<a href="`;
o+=PHP.s(SITE_URL);
o+=`/study/" class="dsw">
  <div class="dsw-ic"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
  <div class="dsw-body">
    <div class="dsw-top">
      <span class="dsw-title">Study Room</span>
      <span class="dsw-live"><i></i>Live</span>
    </div>
    <p class="dsw-desc">Study together with friends — shared Pomodoro timer, live presence &amp; room chat. Every focus round counts towards your streak and points.</p>
  </div>
  <div class="dsw-cta">Join a Room →</div>
</a>


<!-- HERO -->
<div class="dh">
  <div class="dclk">
    <!-- Floating study icons -->
    <div class="dclk-icons">
      <div class="sci sci-1"><svg width="18" height="18" fill="none" stroke="#818cf8" stroke-width="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>
      <div class="sci sci-2"><svg width="16" height="16" fill="none" stroke="#c084fc" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></div>
      <div class="sci sci-3"><svg width="17" height="17" fill="none" stroke="#38bdf8" stroke-width="2" viewBox="0 0 24 24"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/></svg></div>
      <div class="sci sci-4"><svg width="15" height="15" fill="none" stroke="#fbbf24" stroke-width="2" viewBox="0 0 24 24"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg></div>
      <div class="sci sci-5"><svg width="19" height="19" fill="none" stroke="#34d399" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
      <div class="sci sci-6"><svg width="15" height="15" fill="none" stroke="#f87171" stroke-width="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
      <div class="sci sci-7"><svg width="17" height="17" fill="none" stroke="#818cf8" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></div>
      <div class="sci sci-8"><svg width="14" height="14" fill="none" stroke="#c084fc" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
    </div>
    <div id="d-day" class="dclk-day">Wednesday</div>
    <div id="d-date" class="dclk-date">March 11, 2026</div>
    <div class="dclk-tr">
      <div id="d-time" class="dclk-time">12:00:00</div>
      <div id="d-ampm" class="dclk-ap">AM</div>
    </div>
  </div>
  `;
if(!PHP.empty(exams)){
o+=`
  <div class="dcd-wrap">
    <div class="dcd-track" id="dcdTrack">
      `;
for(var a2=PHP.arr(exams),i=0,ex;i<a2.length&&((ex=a2[i]),true);i++){
o+=`
      <div class="dcd" data-exam-date="`;
o+=PHP.s(E(ex['exam_date']));
o+=`">
        <div class="dcd-icons">
          <div class="cdi cdi-1"><svg width="14" height="14" fill="none" stroke="#818cf8" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
          <div class="cdi cdi-2"><svg width="12" height="12" fill="none" stroke="#c084fc" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
          <div class="cdi cdi-3"><svg width="13" height="13" fill="none" stroke="#38bdf8" stroke-width="2" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></div>
          <div class="cdi cdi-4"><svg width="11" height="11" fill="none" stroke="#fbbf24" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
          <div class="cdi cdi-5"><svg width="13" height="13" fill="none" stroke="#34d399" stroke-width="2" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></div>
        </div>
        <div>
          <div class="dcd-chip">⏳ Countdown</div>
          <div class="dcd-nm">`;
o+=PHP.s(E(ex['exam_name']));
o+=`</div>
          <div class="dcd-dt">`;
o+=PHP.s(PHP.date('F j, Y', PHP.strtotime(ex['exam_date'])));
o+=`</div>
        </div>
        <!-- FLIP CARD WRAPPER -->
        <div class="dcd-flip-wrapper" title="Click to see detailed countdown">
          <!-- FRONT: Months + Days -->
          <div class="dcd-face dcd-front">
            <div class="dcd-units">
              <div class="dcd-unit"><span class="dcd-n dcd-months">00</span><span class="dcd-l">Months</span></div>
              <div class="dcd-unit"><span class="dcd-n dcd-days">00</span><span class="dcd-l">Days</span></div>
            </div>
            <div class="dcd-flip-hint">tap for detailed view</div>
          </div>
          <!-- BACK: Days + Hours + Minutes + Seconds -->
          <div class="dcd-face dcd-back">
            <div class="dcd-units dcd-units-detailed">
              <div class="dcd-unit dcd-unit-sm"><span class="dcd-n dcd-b-days">00</span><span class="dcd-l">Days</span></div>
              <div class="dcd-unit dcd-unit-sm"><span class="dcd-n dcd-b-hours">00</span><span class="dcd-l">Hours</span></div>
              <div class="dcd-unit dcd-unit-sm"><span class="dcd-n dcd-b-mins">00</span><span class="dcd-l">Mins</span></div>
              <div class="dcd-unit dcd-unit-sm"><span class="dcd-n dcd-b-secs">00</span><span class="dcd-l">Secs</span></div>
            </div>
            <div class="dcd-flip-hint">tap to go back</div>
          </div>
        </div>
        <div class="dcd-today-lbl" style="display:none;margin-top:10px;font-size:13px;color:#22c55e;font-weight:700">🎉 Exam Day!</div>
      </div>
      `;
}
o+=`
    </div>
    `;
if(PHP.count(exams) > 1){
o+=`
    <div class="dcd-dots" id="dcdDots">
      `;
for(var a3=PHP.arr(exams),i=0,ex;i<a3.length&&((ex=a3[i]),true);i++){
o+=`
      <button class="dcd-dot`;
o+=PHP.s(i===0?' active':'');
o+=`" data-idx="`;
o+=PHP.s(i);
o+=`"></button>
      `;
}
o+=`
    </div>
    `;
}
o+=`
  </div>
  `;
}
o+=`
</div>

<script>
(function(){
  var M=['January','February','March','April','May','June','July','August','September','October','November','December'];
  var D=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  function tick(){
    var n=new Date(), el=document.getElementById('d-day');
    if(!el) return;
    el.textContent=D[n.getDay()];
    document.getElementById('d-date').textContent=M[n.getMonth()]+' '+n.getDate()+', '+n.getFullYear();
    var h=n.getHours(),m=n.getMinutes(),s=n.getSeconds();
    var ap=h>=12?'PM':'AM',h12=h%12||12;
    var p=function(x){return String(x).padStart(2,'0');};
    document.getElementById('d-time').textContent=p(h12)+':'+p(m)+':'+p(s);
    document.getElementById('d-ampm').textContent=ap;
  }
  tick(); setInterval(tick,1000);
})();
</script>


<!-- STATS -->
<div class="dstats">
  <div class="dst dst1">
    <div class="dsth"><div class="dsti" style="background:rgba(99,102,241,.12)">📅</div><span class="dsttag tc">30 days</span></div>
    <div class="dstv">`;
o+=PHP.s(Math.floor(monthMinutes/60));
o+=`<span class="du">h `;
o+=PHP.s(monthMinutes%60);
o+=`m</span></div>
    <div class="dstl">Study Time This Month</div>
  </div>
  <div class="dst dst2">
    <div class="dsth"><div class="dsti" style="background:rgba(6,182,212,.12)">⏱️</div><span class="dsttag tg">Today</span></div>
    <div class="dstv">`;
o+=PHP.s(Math.floor(todayMinutes/60));
o+=`<span class="du">h `;
o+=PHP.s(todayMinutes%60);
o+=`m</span></div>
    <div class="dstl">Today's Study Time</div>
  </div>
  <div class="dst dst3">
    <div class="dsth"><div class="dsti" style="background:rgba(245,158,11,.12)">🔥</div><span class="dsttag `;
o+=PHP.s(streak > 0 ? 'ta' : 'tr');
o+=`">`;
o+=PHP.s(streak > 0 ? 'Active' : 'Start!');
o+=`</span></div>
    <div class="dstv">`;
o+=PHP.s(streak);
o+=`<span class="du"> days</span></div>
    <div class="dstl">Current Streak</div>
  </div>
  <div class="dst dst4">
    <div class="dsth"><div class="dsti" style="background:rgba(16,185,129,.12)">✅</div><span class="dsttag `;
o+=PHP.s(pendingTasks > 5 ? 'tr' : 'tg');
o+=`">`;
o+=PHP.s(pendingTasks > 0 ? 'Pending' : 'All done!');
o+=`</span></div>
    <div class="dstv">`;
o+=PHP.s(pendingTasks);
o+=`</div>
    <div class="dstl">Pending Tasks</div>
  </div>
  <a href="#/habit-tracker" class="dst dst5">
    <div class="dsth"><div class="dsti" style="background:rgba(236,72,153,.12)">🌱</div><span class="dsttag `;
o+=PHP.s(dashHabitTotal===0 ? 'tr' : (dashHabitDoneToday >= dashHabitTotal ? 'tg' : 'ta'));
o+=`">`;
o+=PHP.s(dashHabitTotal===0 ? 'Start!' : (dashHabitDoneToday >= dashHabitTotal ? 'Perfect!' : 'In progress'));
o+=`</span></div>
    <div class="dstv">`;
o+=PHP.s(dashHabitDoneToday);
o+=`<span class="du">/ `;
o+=PHP.s(dashHabitTotal);
o+=`</span></div>
    <div class="dstl">Habits Done Today</div>
  </a>
  <a href="#/timetable" class="dst dst6">
    <div class="dsth"><div class="dsti" style="background:rgba(168,85,247,.12)">🗓️</div><span class="dsttag `;
o+=PHP.s(PHP.count(todaySlots) > 0 ? 'tc' : 'tr');
o+=`">`;
o+=PHP.s(PHP.date('l'));
o+=`</span></div>
    <div class="dstv">`;
o+=PHP.s(PHP.count(todaySlots));
o+=`<span class="du"> class`;
o+=PHP.s(PHP.count(todaySlots)===1?'':'es');
o+=`</span></div>
    <div class="dstl">Classes Today</div>
  </a>
</div>



<!-- CHART + SUBJECTS -->
<div class="dmg">
  <div class="dc">
    <div class="dch">
      <div class="dct">📊 Study Hours</div>
      <div class="dptgl" data-chart="d-wchart">
        <button class="dptb active" data-period="week">Week</button>
        <button class="dptb" data-period="month">Month</button>
      </div>
    </div>
    <div class="dchw"><canvas id="d-wchart"></canvas></div>
  </div>
  <div class="dc">
    <div class="dch">
      <div class="dct">📖 Subjects</div>
      <a href="`;
o+=PHP.s(SITE_URL);
o+=`/subjects" class="dcl">Manage</a>
    </div>
    `;
if(PHP.T(topSubs)){
var maxMin = Math.max(PHP.array_column(topSubs,'total'));
for(var a4=PHP.arr(topSubs),i_a4=0,sub;i_a4<a4.length&&((sub=a4[i_a4]),true);i_a4++){
var pct = maxMin > 0 ? PHP.round((sub['total']/maxMin)*100) : 0;
o+=`
    <div class="dsr">
      <div class="dsi">
        <span class="dsn"><span class="dsdot" style="background:`;
o+=PHP.s(E(sub['color']));
o+=`"></span>`;
o+=PHP.s(E(sub['name']));
o+=`</span>
        <span class="dst_">`;
o+=PHP.s(Math.floor(sub['total']/60));
o+=`h `;
o+=PHP.s(sub['total']%60);
o+=`m</span>
      </div>
      <div class="dpr"><div class="dprb" style="width:`;
o+=PHP.s(pct);
o+=`%;background:`;
o+=PHP.s(E(sub['color']));
o+=`"></div></div>
    </div>
    `;
}
}else{
o+=`
    <div class="dempty"><div class="dei">📚</div><h3>No sessions yet</h3><p>Start logging to see breakdown</p></div>
    `;
}
o+=`
  </div>
</div>


<!-- CLASS HOURS CHART -->
<div class="dc" style="margin-bottom:var(--dg);animation:drise .5s .28s ease both">
  <div class="dch">
    <div class="dct">🏫 Class Hours This Week</div>
    <div style="display:flex;align-items:center;gap:16px">
      `;
if(chTotal > 0){
o+=`
      <span style="font-size:12px;font-weight:700;padding:4px 12px;border-radius:99px;background:rgba(16,185,129,.12);color:#10b981">`;
o+=PHP.s(chRate);
o+=`% Attendance</span>
      `;
}
o+=`
      <a href="`;
o+=PHP.s(SITE_URL);
o+=`/class-hours" class="dcl">View All</a>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:18px">
    <div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:14px;padding:14px 16px">
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px">Total Classes</div>
      <div style="font-family:'Outfit',sans-serif;font-size:26px;font-weight:800;color:var(--text-primary);line-height:1">`;
o+=PHP.s(chTotal);
o+=`</div>
      <div style="font-size:11px;color:var(--text-muted);margin-top:3px">This month</div>
    </div>
    <div style="background:var(--bg-secondary);border:1px solid rgba(16,185,129,.2);border-radius:14px;padding:14px 16px">
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px">Attended</div>
      <div style="font-family:'Outfit',sans-serif;font-size:26px;font-weight:800;color:#10b981;line-height:1">`;
o+=PHP.s(chAtt);
o+=`</div>
      <div style="font-size:11px;color:var(--text-muted);margin-top:3px">`;
o+=PHP.s(Math.floor((chSum['att_mins']??0)/60));
o+=`h `;
o+=PHP.s((chSum['att_mins']??0)%60);
o+=`m</div>
    </div>
    <div style="background:var(--bg-secondary);border:1px solid rgba(239,68,68,.2);border-radius:14px;padding:14px 16px">
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px">Missed</div>
      <div style="font-family:'Outfit',sans-serif;font-size:26px;font-weight:800;color:#ef4444;line-height:1">`;
o+=PHP.s(chTotal - chAtt);
o+=`</div>
      <div style="font-size:11px;color:var(--text-muted);margin-top:3px">`;
o+=PHP.s(Math.floor(((chSum['total_mins']??0)-(chSum['att_mins']??0))/60));
o+=`h `;
o+=PHP.s(((chSum['total_mins']??0)-(chSum['att_mins']??0))%60);
o+=`m</div>
    </div>
  </div>
  <div style="height:180px"><canvas id="d-classchart"></canvas></div>
</div>


<!-- SPACED REPETITION -->
<div class="dc" style="margin-bottom:var(--dg);animation:drise .5s .3s ease both">
  <div class="dch">
    <div class="dct">🔁 Spaced Repetition</div>
    `;
if(dueReviewCount > 0){
o+=`
      <span style="font-size:11px;font-weight:700;padding:4px 12px;border-radius:99px;background:rgba(239,68,68,.12);color:#ef4444;flex-shrink:0">`;
o+=PHP.s(dueReviewCount);
o+=` due</span>
    `;
}else{
o+=`
      <a href="`;
o+=PHP.s(SITE_URL);
o+=`/study-log" class="dcl">Study Log</a>
    `;
}
o+=`
  </div>

  `;
if(PHP.T(dueReviews)){
o+=`
    <div id="dashSrList">
    `;
for(var a5=PHP.arr(dueReviews),i_a5=0,r;i_a5<a5.length&&((r=a5[i_a5]),true);i_a5++){
var daysAgo = Math.max(0, ~~((PHP.strtotime('today') - PHP.strtotime(r['last_studied_date'])) / 86400));
o+=`
    <div id="dashSrRow`;
o+=PHP.s(r['id']);
o+=`" style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:14px;padding:12px 14px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
      <div style="min-width:0;flex:1 1 180px">
        <div style="display:flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
          <span class="dsdot" style="background:`;
o+=PHP.s(E(r['subject_color']));
o+=`"></span>`;
o+=PHP.s(E(r['topic']));
o+=`
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:2px">`;
o+=PHP.s(E(r['subject_name']));
o+=` &bull; studied `;
o+=PHP.s(daysAgo === 0 ? 'today' : daysAgo+'d ago');
o+=`</div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0">
        <button onclick="dashReviewAction('review_done',`;
o+=PHP.s(r['id']);
o+=`,this)" style="padding:7px 11px;border-radius:9px;border:none;background:rgba(99,102,241,.14);color:#818cf8;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap">✅ Reviewed</button>
        <button onclick="dashReviewAction('mastered',`;
o+=PHP.s(r['id']);
o+=`,this)" style="padding:7px 11px;border-radius:9px;border:none;background:rgba(16,185,129,.14);color:#10b981;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap">🎓 Mastered</button>
      </div>
    </div>
    `;
}
o+=`
    </div>
    `;
if(dueReviewCount > PHP.count(dueReviews)){
o+=`
      <div style="text-align:center;margin-top:6px"><a href="`;
o+=PHP.s(SITE_URL);
o+=`/study-log" class="dcl" style="display:inline-block">+`;
o+=PHP.s(dueReviewCount - PHP.count(dueReviews));
o+=` more due</a></div>
    `;
}
o+=`
  `;
}else{
o+=`
    <div class="dempty"><div class="dei">🎉</div><h3>Nothing due for review</h3><p>Log a topic in your Study Log and we'll remind you when it's time to revisit it.</p></div>
  `;
}
o+=`

  `;
if(PHP.T(upcomingReviews)){
o+=`
  <div style="margin-top:`;
o+=PHP.s(dueReviews ? '14px' : '2px');
o+=`;padding-top:12px;border-top:1px solid var(--border)">
    <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px">Coming up</div>
    `;
for(var a6=PHP.arr(upcomingReviews),i_a6=0,u;i_a6<a6.length&&((u=a6[i_a6]),true);i_a6++){
o+=`
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:5px 0;font-size:12px">
      <span style="display:flex;align-items:center;gap:7px;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0"><span class="dsdot" style="background:`;
o+=PHP.s(E(u['subject_color']));
o+=`;flex-shrink:0"></span>`;
o+=PHP.s(E(u['topic']));
o+=`</span>
      <span style="color:var(--text-muted);flex-shrink:0">`;
o+=PHP.s(PHP.date('M j', PHP.strtotime(u['next_review_date'])));
o+=`</span>
    </div>
    `;
}
o+=`
  </div>
  `;
}
o+=`
</div>


<!-- TABLES -->
<div class="dtg">
  <div class="dc" style="padding-bottom:16px;animation-delay:.35s">
    <div class="dch">
      <div class="dct">⏱️ Recent Sessions</div>
      <a href="`;
o+=PHP.s(SITE_URL);
o+=`/study-log" class="dcl">View All</a>
    </div>
    `;
if(PHP.T(recent)){
o+=`
    <!-- Desktop header -->
    <div class="drow-hd">
      <span>Date</span><span>Subject</span><span style="text-align:right">Duration</span>
    </div>
    `;
for(var a7=PHP.arr(recent),i_a7=0,s;i_a7<a7.length&&((s=a7[i_a7]),true);i_a7++){
o+=`
    <div class="drow">
      <span class="drow-date">`;
o+=PHP.s(PHP.date('M j', PHP.strtotime(s['date'])));
o+=`</span>
      <span class="drow-subj">
        <span class="dinl" style="background:`;
o+=PHP.s(E(s['color']));
o+=`"></span>`;
o+=PHP.s(E(s['subject_name']));
o+=`
      </span>
      <span class="drow-val"><span class="ddur">`;
o+=PHP.s(Math.floor(s['duration_minutes']/60));
o+=`h `;
o+=PHP.s(s['duration_minutes']%60);
o+=`m</span></span>
    </div>
    `;
}
o+=`
    `;
}else{
o+=`
    <div class="dempty"><div class="dei">⏱️</div><h3>No sessions yet</h3><p>Start logging your study time</p></div>
    `;
}
o+=`
  </div>

  <div class="dc" style="padding-bottom:16px;animation-delay:.4s">
    <div class="dch">
      <div class="dct">📝 Recent Results</div>
      <a href="`;
o+=PHP.s(SITE_URL);
o+=`/marks" class="dcl">View All</a>
    </div>
    `;
if(PHP.T(recentMarks)){
o+=`
    <!-- Desktop header -->
    <div class="drow-hd">
      <span>Exam</span><span>Subject</span><span style="text-align:right">Score</span>
    </div>
    `;
for(var a8=PHP.arr(recentMarks),i_a8=0,m;i_a8<a8.length&&((m=a8[i_a8]),true);i_a8++){
var pct = PHP.round((m['marks_obtained']/m['total_marks'])*100);
var sc  = pct>=75?'dsca':(pct>=50?'dscb':'dscc');
o+=`
    <div class="drow">
      <span class="drow-date">`;
o+=PHP.s(E(m['exam_name']));
o+=`</span>
      <span class="drow-subj">
        <span class="dinl" style="background:`;
o+=PHP.s(E(m['color']));
o+=`"></span>`;
o+=PHP.s(E(m['subject_name']));
o+=`
      </span>
      <span class="drow-val"><span class="dsc `;
o+=PHP.s(sc);
o+=`">`;
o+=PHP.s(pct);
o+=`%</span></span>
    </div>
    `;
}
o+=`
    `;
}else{
o+=`
    <div class="dempty"><div class="dei">📝</div><h3>No marks yet</h3><p>Add your exam results</p></div>
    `;
}
o+=`
  </div>
</div>

<!-- WEEKLY TARGETS -->
<div class="dc" style="margin-bottom:var(--dg);animation-delay:.44s">
  <div class="dch">
    <div class="dct">🎯 Weekly Study Targets</div>
    <a href="`;
o+=PHP.s(SITE_URL);
o+=`/subjects" class="dcl">Manage</a>
  </div>
  `;
if(!PHP.empty(weekTargets)){
for(var a9=PHP.arr(weekTargets),i_a9=0,wt;i_a9<a9.length&&((wt=a9[i_a9]),true);i_a9++){
var targetMins = +wt['weekly_target_hours'] * 60;
var wkMins     = ~~wt['week_mins'];
var pct        = targetMins > 0 ? Math.min(100, PHP.round((wkMins/targetMins)*100)) : 0;
var wH = Math.floor(wkMins/60);
var wM = wkMins%60;
var tH = Math.floor(targetMins/60);
var tM = ~~targetMins%60;
var done = wkMins >= targetMins;
var bc = pct>=100?'#10b981':(pct>=60?'#f59e0b':E(wt['color']));
o+=`
  <div class="dti">
    <div class="dtr_">
      <span class="dtnm">
        <span class="dsdot" style="background:`;
o+=PHP.s(E(wt['color']));
o+=`"></span>
        `;
o+=PHP.s(E(wt['name']));
o+=`
        `;
if(PHP.T(done)){
o+=`<span class="dtdc">✓ Done</span>`;
}
o+=`
      </span>
      <span class="dtt `;
o+=PHP.s(done?'done':'');
o+=`">`;
o+=PHP.s(wH);
o+=`h `;
o+=PHP.s(wM);
o+=`m / `;
o+=PHP.s(tH);
o+=`h`;
o+=PHP.s(tM>0?' '+tM+'m':'');
o+=`</span>
    </div>
    <div class="dpr" style="height:7px"><div class="dprb" style="width:`;
o+=PHP.s(pct);
o+=`%;background:`;
o+=PHP.s(bc);
o+=`"></div></div>
  </div>
  `;
}
}else{
o+=`
  <div class="dempty" style="padding:20px">
    <div class="dei">🎯</div>
    <h3>No weekly targets set</h3>
    <p>Go to Subjects and set weekly hour targets to track your progress here.</p>
    <a href="`;
o+=PHP.s(SITE_URL);
o+=`/subjects" class="dqb dqp" style="margin-top:14px;display:inline-flex">Set Targets</a>
  </div>
  `;
}
o+=`
</div>

<!-- TOP PERFORMERS -->
`;
if(!PHP.empty(top3)){
o+=`
<div class="dc" style="animation-delay:.5s">
  <div class="dch">
    <div class="dct">🏆 Top Performers This Month</div>
    <a href="`;
o+=PHP.s(SITE_URL);
o+=`/leaderboard" class="dcl">Full Leaderboard</a>
  </div>
  <div class="dp3g">
  `;
var medals  = ['🥇','🥈','🥉'];
var pColors = ['#f59e0b','#94a3b8','#cd7c2f'];
var pBgs    = ['rgba(245,158,11,.10)','rgba(148,163,184,.08)','rgba(205,124,47,.08)'];
for(var a10=PHP.arr(top3),i=0,p;i<a10.length&&((p=a10[i]),true);i++){
var hrs  = Math.floor(p['total_mins']/60);
var mins = p['total_mins']%60;
var avg  = PHP.round(p['avg_mark'],1);
var init = PHP.strtoupper(p['name'][0]);
o+=`
  <div class="dprf" style="--dpc:`;
o+=PHP.s(pColors[i]);
o+=`;--dpb:`;
o+=PHP.s(pBgs[i]);
o+=`;--dpg:`;
o+=PHP.s(pBgs[i]);
o+=`;border-color:`;
o+=PHP.s(pColors[i]);
o+=`28"
       onmouseover="this.style.boxShadow='0 12px 32px `;
o+=PHP.s(pColors[i]);
o+=`22'"
       onmouseout="this.style.boxShadow=''">
    <div class="dmdl">`;
o+=PHP.s(medals[i]);
o+=`</div>
    <div class="dpav">
      `;
if(!PHP.empty(p['avatar_url'])){
o+=`
        <img src="`;
o+=PHP.s(E(p['avatar_url']));
o+=`">
      `;
}else{
o+=PHP.s(init);
}
o+=`
    </div>
    <div class="dpnm">`;
o+=PHP.s(E(p['name']));
o+=`</div>
    <div class="dpst"><span class="dpsl">Study Time</span><span class="dpsv">`;
o+=PHP.s(hrs);
o+=`h `;
o+=PHP.s(mins);
o+=`m</span></div>
    <div class="dpst"><span class="dpsl">Sessions</span><span class="dpsv">`;
o+=PHP.s(p['sessions']);
o+=`</span></div>
    `;
if(avg > 0){
o+=`
    <div class="dpst">
      <span class="dpsl">Avg Mark</span>
      <span class="dpsv" style="color:`;
o+=PHP.s(avg>=75?'#10b981':(avg>=55?'#f59e0b':'#ef4444'));
o+=`">`;
o+=PHP.s(avg);
o+=`%</span>
    </div>
    `;
}
o+=`
  </div>
  `;
}
o+=`
  </div>
</div>
`;
}
o+=`

</div><!-- .dp -->

<script>
(function(){
  var labels = `;
o+=PHP.s(PHP.json_encode(PHP.array_column(weekData,'date')));
o+=`;
  var mins   = `;
o+=PHP.s(PHP.json_encode(PHP.array_column(weekData,'minutes')));
o+=`;
  var ctx    = document.getElementById('d-wchart').getContext('2d');

  var dChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets:[{
        label: 'Study Time',
        data: mins,
        backgroundColor: mins.map(function(v,i){
          return i===mins.length-1 ? '#6366f1' : 'rgba(99,102,241,0.4)';
        }),
        hoverBackgroundColor: '#818cf8',
        borderRadius: 9,
        borderSkipped: false,
        borderWidth: 0,
      }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{display:false},
        tooltip:{
          backgroundColor:'rgba(16,16,24,.96)',borderColor:'rgba(99,102,241,.3)',borderWidth:1,
          cornerRadius:10,padding:12,
          titleFont:{family:"'Plus Jakarta Sans',sans-serif",size:12},
          bodyFont:{family:"'Plus Jakarta Sans',sans-serif",size:13,weight:'700'},
          callbacks:{ label:function(ctx){ var v=ctx.raw; return '  '+Math.floor(v/60)+'h '+(v%60)+'m'; } }
        }
      },
      scales:{
        x:{ grid:{display:false}, border:{display:false}, ticks:{color:'#64748b',font:{family:"'Plus Jakarta Sans',sans-serif",size:12}} },
        y:{ grid:{color:'rgba(42,42,61,.35)'}, border:{display:false}, ticks:{color:'#64748b',font:{family:"'Plus Jakarta Sans',sans-serif",size:11},callback:function(v){return Math.floor(v/60)+'h';}} }
      },
      animation:{duration:600,easing:'easeInOutCubic'}
    }
  });

  document.querySelectorAll('.dptb[data-period]').forEach(function(btn){
    btn.addEventListener('click', async function(){
      btn.closest('.dptgl').querySelectorAll('.dptb').forEach(function(b){b.classList.remove('active');});
      btn.classList.add('active');
      try {
        var res  = await stFetch('`;
o+=PHP.s(SITE_URL);
o+=`/dashboard-chart.php?period='+btn.dataset.period, {headers:{'X-Requested-With':'XMLHttpRequest'}});
        var data = await res.json();
        if (data.success) {
          var l=data.data.map(function(d){return d.date;});
          var m=data.data.map(function(d){return d.minutes;});
          dChart.data.labels=l;
          dChart.data.datasets[0].data=m;
          dChart.data.datasets[0].backgroundColor=m.map(function(v,i){return i===m.length-1?'#6366f1':'rgba(99,102,241,0.4)';});
          dChart.update();
        }
      } catch(e){ console.error(e); }
    });
  });

  // ── Class Hours Chart ──
  (function(){
    var clCtx = document.getElementById('d-classchart');
    if (!clCtx) return;
    var clLabels = `;
o+=PHP.s(PHP.json_encode(PHP.array_column(classWeekData,'date')));
o+=`;
    var clTotal  = `;
o+=PHP.s(PHP.json_encode(PHP.array_column(classWeekData,'total')));
o+=`;
    var clAttend = `;
o+=PHP.s(PHP.json_encode(PHP.array_column(classWeekData,'attended')));
o+=`;
    new Chart(clCtx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: clLabels,
        datasets: [
          { label: 'Attended', data: clAttend, backgroundColor: 'rgba(16,185,129,0.75)', hoverBackgroundColor: '#34d399', borderRadius: 8, borderSkipped: false, borderWidth: 0 },
          { label: 'Scheduled', data: clTotal, backgroundColor: 'rgba(99,102,241,0.22)', hoverBackgroundColor: 'rgba(99,102,241,0.38)', borderRadius: 8, borderSkipped: false, borderWidth: 0 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top', labels: { color: '#94a3b8', font: { family:"'Plus Jakarta Sans',sans-serif", size: 11 }, boxWidth: 10, boxHeight: 10, borderRadius: 4, padding: 14 } },
          tooltip: {
            backgroundColor: 'rgba(16,16,24,.96)', borderColor: 'rgba(99,102,241,.3)', borderWidth: 1,
            cornerRadius: 10, padding: 12,
            titleFont: { family:"'Plus Jakarta Sans',sans-serif", size: 12 },
            bodyFont: { family:"'Plus Jakarta Sans',sans-serif", size: 13, weight: '700' },
            callbacks: { label: function(ctx){ var v=ctx.raw; return '  '+Math.floor(v/60)+'h '+(v%60)+'m'; } }
          }
        },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { color: '#64748b', font: { family:"'Plus Jakarta Sans',sans-serif", size: 12 } } },
          y: { grid: { color: 'rgba(42,42,61,.35)' }, border: { display: false }, ticks: { color: '#64748b', font: { family:"'Plus Jakarta Sans',sans-serif", size: 11 }, callback: function(v){ return Math.floor(v/60)+'h'; } } }
        },
        animation: { duration: 700, easing: 'easeInOutCubic' }
      }
    });
  })();

})();
</script>

`;
if(!PHP.empty(exams)){
o+=`
<script>
(function(){
  var cards=document.querySelectorAll('#dcdTrack .dcd');
  var track=document.getElementById('dcdTrack');
  var dots=document.querySelectorAll('.dcd-dot');
  var total=cards.length,cur=0;
  function pad(n){return String(n).padStart(2,'0');}
  function animateDigit(el, val) {
    var str = pad(val);
    if (el && el.textContent !== str) {
      el.textContent = str;
      el.classList.remove('tick');
      void el.offsetWidth; // reflow
      el.classList.add('tick');
    }
  }

  function tickCard(card){
    var target=new Date(card.getAttribute('data-exam-date')+' 08:00:00');
    var now=new Date(),diff=target-now;
    var mEl=card.querySelector('.dcd-months'),dEl=card.querySelector('.dcd-days'),lEl=card.querySelector('.dcd-today-lbl');
    var bDEl=card.querySelector('.dcd-b-days'),bHEl=card.querySelector('.dcd-b-hours'),bMEl=card.querySelector('.dcd-b-mins'),bSEl=card.querySelector('.dcd-b-secs');
    if(diff<=0){
      if(mEl)mEl.textContent='00';if(dEl)dEl.textContent='00';
      if(bDEl)bDEl.textContent='00';if(bHEl)bHEl.textContent='00';if(bMEl)bMEl.textContent='00';if(bSEl)bSEl.textContent='00';
      if(lEl)lEl.style.display='block';return;
    }
    // Front face: months + remaining days
    var y1=now.getFullYear(),mo1=now.getMonth(),d1=now.getDate();
    var y2=target.getFullYear(),mo2=target.getMonth(),d2=target.getDate();
    var months=(y2-y1)*12+(mo2-mo1);if(d2<d1)months--;if(months<0)months=0;
    var after=new Date(y1,mo1+months,d1);
    var frontDays=Math.floor((target-after)/86400000);
    if(mEl)mEl.textContent=pad(months);if(dEl)dEl.textContent=pad(frontDays);
    // Back face: total days, hours, minutes, seconds
    var totalSecs=Math.floor(diff/1000);
    var bSecs=totalSecs%60;
    var totalMins=Math.floor(totalSecs/60);
    var bMins=totalMins%60;
    var totalHrs=Math.floor(totalMins/60);
    var bHrs=totalHrs%24;
    var bDays=Math.floor(totalHrs/24);
    animateDigit(bDEl,bDays);
    animateDigit(bHEl,bHrs);
    animateDigit(bMEl,bMins);
    animateDigit(bSEl,bSecs);
  }
  function tickAll(){cards.forEach(tickCard);}
  tickAll();
  setInterval(function(){cards.forEach(function(c){ var fw=c.querySelector('.dcd-flip-wrapper'); if(fw&&fw.classList.contains('flipped'))tickCard(c); });},1000);
  setInterval(tickAll,60000);

  // Flip on click
  cards.forEach(function(card){
    var fw=card.querySelector('.dcd-flip-wrapper');
    if(!fw)return;
    fw.addEventListener('click',function(e){
      e.stopPropagation();
      fw.classList.toggle('flipped');
      if(fw.classList.contains('flipped'))tickCard(card);
    });
  });
  function goTo(idx){
    cur=(idx+total)%total;
    if(track)track.style.transform='translateX(-'+(cur*100)+'%)';
    dots.forEach(function(d,i){d.classList.toggle('active',i===cur);});
  }
  dots.forEach(function(d){d.addEventListener('click',function(){goTo(parseInt(d.getAttribute('data-idx')));});});
  if(total>1){setInterval(function(){goTo(cur+1);},5000);}
  var sx=0,moved=0,drag=false;
  if(track){
    track.addEventListener('mousedown',function(e){drag=true;sx=e.clientX;moved=0;track.classList.add('dragging');});
    track.addEventListener('mousemove',function(e){if(drag)moved=e.clientX-sx;});
    track.addEventListener('mouseup',function(){if(!drag)return;drag=false;track.classList.remove('dragging');if(Math.abs(moved)>40)goTo(moved<0?cur+1:cur-1);});
    track.addEventListener('mouseleave',function(){if(drag){drag=false;track.classList.remove('dragging');}});
    track.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;moved=0;},{passive:true});
    track.addEventListener('touchmove',function(e){moved=e.touches[0].clientX-sx;},{passive:true});
    track.addEventListener('touchend',function(){if(Math.abs(moved)>40)goTo(moved<0?cur+1:cur-1);});
  }
})();
</script>
`;
}
o+=`

`;
if(!PHP.empty(todaySlots)){
o+=`
<!-- ══════════════════════════════════════════════════════
     CLASS ENDED ATTENDANCE POPUP
══════════════════════════════════════════════════════ -->
<div id="attPopupOverlay" style="
    display:none;position:fixed;inset:0;z-index:9999;
    background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);
    align-items:center;justify-content:center;padding:16px">
    <div id="attPopupBox" style="
        background:var(--bg-card);border:1px solid rgba(99,102,241,.35);
        border-radius:20px;max-width:380px;width:100%;
        box-shadow:0 24px 60px rgba(0,0,0,.5);
        animation:attPop .3s cubic-bezier(.34,1.56,.64,1) both">

        <!-- Header -->
        <div style="padding:20px 22px 16px;border-bottom:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:10px">
                <div style="width:40px;height:40px;border-radius:12px;background:rgba(99,102,241,.15);display:flex;align-items:center;justify-content:center;font-size:20px">🏫</div>
                <div>
                    <div style="font-size:15px;font-weight:800;color:var(--text-primary)" id="attPopupTitle">Class Ended</div>
                    <div style="font-size:12px;color:var(--text-muted)" id="attPopupTime"></div>
                </div>
            </div>
        </div>

        <!-- Body -->
        <div style="padding:18px 22px">
            <div style="font-size:13px;color:var(--text-secondary);margin-bottom:18px">
                Did you attend this class?
            </div>

            <!-- Buttons -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
                <button onclick="markAttendance(1)"
                    style="padding:13px;border:2px solid rgba(34,197,94,.3);border-radius:12px;
                           background:rgba(34,197,94,.08);color:#22c55e;
                           font-size:14px;font-weight:700;cursor:pointer;transition:all .2s"
                    onmouseover="this.style.background='rgba(34,197,94,.18)'"
                    onmouseout="this.style.background='rgba(34,197,94,.08)'">
                    ✓ Yes, Attended
                </button>
                <button onclick="markAttendance(0)"
                    style="padding:13px;border:2px solid rgba(239,68,68,.3);border-radius:12px;
                           background:rgba(239,68,68,.08);color:#ef4444;
                           font-size:14px;font-weight:700;cursor:pointer;transition:all .2s"
                    onmouseover="this.style.background='rgba(239,68,68,.18)'"
                    onmouseout="this.style.background='rgba(239,68,68,.08)'">
                    ✗ No, Missed
                </button>
            </div>

            <!-- Success state (hidden initially) -->
            <div id="attPopupSuccess" style="display:none;text-align:center;padding:8px 0">
                <div style="font-size:28px;margin-bottom:6px" id="attSuccessIcon">✅</div>
                <div style="font-size:13px;font-weight:700;color:var(--text-primary)" id="attSuccessMsg">Logged!</div>
            </div>

            <div id="attPopupError" style="display:none;font-size:12px;color:#ef4444;text-align:center;margin-top:6px"></div>
        </div>
    </div>
</div>

<style>
@keyframes attPop {
    from { opacity:0; transform:scale(.88) translateY(16px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
}
</style>

<script>
(function(){
    // Timetable slots — already_logged=1 means DB already has an entry today
    var todaySlots = `;
o+=PHP.s(PHP.json_encode(todaySlotsJson));
o+=`;

    var TODAY = new Date().toISOString().split('T')[0];
    var SK    = 'att_done_' + TODAY + '_';

    var pending = [];
    var current = null;

    // Convert "HH:MM" to minutes since midnight
    function toMins(hhmm) {
        var p = hhmm.split(':');
        return parseInt(p[0]) * 60 + parseInt(p[1]);
    }

    // Slot is "done" if: DB already has a log OR user marked in this session
    function alreadyDone(sl) {
        return sl.already_logged === 1 || sessionStorage.getItem(SK + sl.id) !== null;
    }
    function markDone(slotId) {
        sessionStorage.setItem(SK + slotId, '1');
    }

    function checkSlots() {
        var d   = new Date();
        var now = d.getHours() * 60 + d.getMinutes();

        todaySlots.forEach(function(sl) {
            var endMins  = toMins(sl.end);

            // Show popup ONLY if:
            // 1. Class has already ended (now >= end time)
            // 2. Not more than 2 hours after end (not too stale)
            // 3. Not already logged in DB or this session
            if (now >= endMins && now < (endMins + 120) && !alreadyDone(sl)) {
                var inPending = pending.some(function(p){ return p.id === sl.id; });
                if (!inPending && (!current || current.id !== sl.id)) {
                    pending.push(sl);
                }
            }
        });

        if (!current && pending.length > 0) showPopup(pending.shift());
    }

    function showPopup(slot) {
        current = slot;
        document.getElementById('attPopupTitle').textContent = slot.label;
        document.getElementById('attPopupTime').textContent  = slot.start + ' – ' + slot.end;
        document.getElementById('attPopupSuccess').style.display = 'none';
        document.getElementById('attPopupError').style.display   = 'none';

        // Restore buttons
        document.getElementById('attPopupBox').querySelectorAll('button').forEach(function(b){
            b.style.display = '';
        });

        var ov = document.getElementById('attPopupOverlay');
        ov.style.display = 'flex';

        // Clicking backdrop does NOT close (must fill form)
        ov.onclick = function(e) {
            if (e.target === ov) {
                // Shake the box to indicate it must be filled
                var box = document.getElementById('attPopupBox');
                box.style.animation = 'none';
                box.offsetHeight; // reflow
                box.style.animation = 'attShake .4s ease';
            }
        };
    }

    function hidePopup() {
        document.getElementById('attPopupOverlay').style.display = 'none';
        current = null;
        // Show next pending after short delay
        setTimeout(function(){
            if (pending.length > 0) showPopup(pending.shift());
        }, 600);
    }

    window.markAttendance = async function(attended) {
        if (!current) return;

        var fd = new FormData();
        fd.append('action',     'add');
        fd.append('class_date', TODAY);
        fd.append('subject_id', current.subject_id || 0);
        fd.append('start_time', current.start);
        fd.append('end_time',   current.end);
        fd.append('class_type', 'regular');
        fd.append('attended',   attended);
        fd.append('notes',      '');

        var errEl  = document.getElementById('attPopupError');
        var sucEl  = document.getElementById('attPopupSuccess');
        errEl.style.display = 'none';

        try {
            var res  = await stFetch('`;
o+=PHP.s(SITE_URL);
o+=`/class-hours', {
                method:'POST',
                headers:{'X-Requested-With':'XMLHttpRequest'},
                body: fd
            });
            var data = await res.json();

            if (data.success || data.message === 'Please fill in all required fields.') {
                // Mark done regardless (even if subject_id=0 we skip)
                markDone(current.id);
                // Also update the in-memory slot so interval won't re-queue it
                todaySlots.forEach(function(sl){ if(sl.id === current.id) sl.already_logged = 1; });

                // Show success
                document.getElementById('attPopupBox').querySelectorAll('button').forEach(function(b){
                    b.style.display = 'none';
                });
                document.getElementById('attSuccessIcon').textContent = attended ? '✅' : '😔';
                document.getElementById('attSuccessMsg').textContent  = attended ? 'Attendance marked!' : 'Marked as missed.';
                sucEl.style.display = 'block';
                setTimeout(hidePopup, 1200);
            } else {
                errEl.textContent    = data.message || 'Error saving.';
                errEl.style.display  = 'block';
            }
        } catch(e) {
            errEl.textContent   = 'Network error. Please try again.';
            errEl.style.display = 'block';
        }
    };

    // Add shake animation
    var st = document.createElement('style');
    st.textContent = '@keyframes attShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}';
    document.head.appendChild(st);

    // Check every 30 seconds + immediately
    checkSlots();
    checkInt = setInterval(checkSlots, 30000);
})();
</script>
`;
}
o+=`

`;
if(PHP.T(showYearPopup)){
o+=`
<div id="alYearOverlay" style="position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.65);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;">
<style>
@keyframes alyUp{from{opacity:0;transform:translateY(28px) scale(.96)}to{opacity:1;transform:none}}
#alYearModal{background:var(--bg-card);border:1px solid rgba(99,102,241,.35);border-radius:22px;padding:36px 32px 30px;width:min(94vw,400px);box-shadow:0 24px 80px rgba(0,0,0,.45);animation:alyUp .35s cubic-bezier(.34,1.56,.64,1);}
.aly-icon{width:52px;height:52px;border-radius:16px;background:linear-gradient(135deg,rgba(99,102,241,.2),rgba(168,85,247,.2));border:1px solid rgba(99,102,241,.3);display:flex;align-items:center;justify-content:center;margin:0 auto 18px;}
.aly-title{font-family:var(--df);font-size:20px;font-weight:800;color:var(--text-primary);text-align:center;margin-bottom:8px;}
.aly-sub{font-size:13px;color:var(--text-muted);text-align:center;line-height:1.5;margin-bottom:28px;}
.aly-opts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px;}
.aly-opt{border:2px solid var(--border);border-radius:14px;padding:14px 10px;text-align:center;cursor:pointer;background:var(--bg-secondary);transition:all .18s ease;}
.aly-opt:hover{border-color:rgba(99,102,241,.5);background:rgba(99,102,241,.06);}
.aly-opt.selected{border-color:var(--accent);background:rgba(99,102,241,.12);box-shadow:0 0 0 3px rgba(99,102,241,.18);}
.aly-opt-yr{font-size:22px;font-weight:900;color:var(--text-primary);line-height:1;font-family:var(--df);}
.aly-opt-lbl{font-size:10px;font-weight:600;color:var(--text-muted);letter-spacing:1px;text-transform:uppercase;margin-top:4px;}
.aly-btn{width:100%;padding:13px;border:none;border-radius:12px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;font-family:var(--df);font-size:14px;font-weight:700;cursor:pointer;transition:opacity .18s,transform .18s;opacity:.4;pointer-events:none;}
.aly-btn.ready{opacity:1;pointer-events:auto;}
.aly-btn.ready:hover{transform:translateY(-1px);}
</style>
<div id="alYearModal">
  <div class="aly-icon"><svg width="26" height="26" fill="none" stroke="#818cf8" stroke-width="2" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></div>
  <div class="aly-title">ඔබේ A/L Exam Year?</div>
  <div class="aly-sub">ඔබේ A/L examination year select කරන්න.<br>ඒ අනුව countdown show වේ.</div>
  <div class="aly-opts">
    `;
for(y=~~PHP.date('Y'); y<=~~PHP.date('Y')+2; y++){
o+=`
    <div class="aly-opt" data-year="`;
o+=PHP.s(y);
o+=`" onclick="alySelect(this)">
      <div class="aly-opt-yr">`;
o+=PHP.s(y);
o+=`</div>
      <div class="aly-opt-lbl">A/L `;
o+=PHP.s(y);
o+=`</div>
    </div>
    `;
}
o+=`
  </div>
  <button class="aly-btn" id="alyBtn" onclick="alySave()">Confirm &rarr;</button>
</div>
</div>
<script>
var _alySel=null;
function alySelect(el){
  document.querySelectorAll('.aly-opt').forEach(function(o){o.classList.remove('selected');});
  el.classList.add('selected');
  _alySel=el.getAttribute('data-year');
  var b=document.getElementById('alyBtn');
  b.classList.add('ready');
  b.textContent=_alySel+' A/L →';
}
function alySave(){
  if(!_alySel)return;
  var b=document.getElementById('alyBtn');
  b.textContent='Saving…';b.style.pointerEvents='none';
  var fd=new FormData();
  fd.append('action','save_al_year');
  fd.append('al_year',_alySel);
  stFetch(location.href,{method:'POST',headers:{'X-Requested-With':'XMLHttpRequest'},body:fd})
  .then(function(r){return r.json();})
  .then(function(d){
    if(d.success){
      var o=document.getElementById('alYearOverlay');
      o.style.transition='opacity .3s';o.style.opacity='0';
      setTimeout(function(){o.remove();stReload();},320);
    }
  });
}
</script>
`;
}
o+=`

<script>
/* ── Spaced repetition quick actions ── */
async function dashReviewAction(kind, id, btn) {
  var row = document.getElementById('dashSrRow'+id);
  var action = kind === 'mastered' ? 'sr_mastered' : 'sr_review_done';
  if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }
  try {
    var fd = new FormData(); fd.append('action', action); fd.append('id', id);
    var res  = await stFetch(location.href, {method:'POST', headers:{'X-Requested-With':'XMLHttpRequest'}, body:fd});
    var data = await res.json();
    if (data.success && row) {
      row.style.transition = 'opacity .25s, transform .25s';
      row.style.opacity = '0'; row.style.transform = 'translateX(8px)';
      setTimeout(function(){ stReload(); }, 350);
    } else if (btn) {
      btn.disabled = false; btn.style.opacity = '1';
    }
  } catch(e) {
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
  }
}
</script>

<script>
/* ── Tutorial Banner ── */
(function(){
  var STORAGE_KEY = 'st_tutorial_banner_dismissed';
  var banner = document.getElementById('tutorialBanner');
  var closeBtn = document.getElementById('tutorialBannerClose');
  if (!banner) return;

  // Hide if already dismissed
  if (localStorage.getItem(STORAGE_KEY) === '1') {
    banner.style.display = 'none';
    return;
  }

  // Close button handler
  closeBtn.addEventListener('click', function(){
    banner.style.transition = 'opacity .3s, transform .3s, max-height .4s, margin .4s, padding .4s';
    banner.style.opacity = '0';
    banner.style.transform = 'translateY(-8px)';
    banner.style.maxHeight = banner.offsetHeight + 'px';
    // Collapse height smoothly
    requestAnimationFrame(function(){
      banner.style.maxHeight = '0';
      banner.style.marginBottom = '0';
      banner.style.paddingTop = '0';
      banner.style.paddingBottom = '0';
      banner.style.borderWidth = '0';
    });
    setTimeout(function(){
      banner.style.display = 'none';
      localStorage.setItem(STORAGE_KEY, '1');
    }, 420);
  });
})();
</script>

<script>
/* ── Telegram Channel Banner ── */
(function(){
  var STORAGE_KEY = 'st_telegram_banner_dismissed';
  var banner = document.getElementById('telegramBanner');
  var closeBtn = document.getElementById('telegramBannerClose');
  var joinBtn = document.getElementById('telegramBannerJoin');
  if (!banner) return;

  // Hide if already dismissed before
  if (localStorage.getItem(STORAGE_KEY) === '1') {
    banner.style.display = 'none';
    return;
  }

  function collapseAndDismiss() {
    banner.style.transition = 'opacity .3s, transform .3s, max-height .4s, margin .4s, padding .4s';
    banner.style.opacity = '0';
    banner.style.transform = 'translateY(-8px)';
    banner.style.maxHeight = banner.offsetHeight + 'px';
    requestAnimationFrame(function(){
      banner.style.maxHeight = '0';
      banner.style.marginBottom = '0';
      banner.style.paddingTop = '0';
      banner.style.paddingBottom = '0';
      banner.style.borderWidth = '0';
    });
    setTimeout(function(){
      banner.style.display = 'none';
      localStorage.setItem(STORAGE_KEY, '1');
    }, 420);
  }

  // Close button handler
  closeBtn.addEventListener('click', collapseAndDismiss);

  // Joining also dismisses the banner (link still opens in a new tab first)
  if (joinBtn) {
    joinBtn.addEventListener('click', function(){
      setTimeout(collapseAndDismiss, 150);
    });
  }
})();
</script>

`;
return o;}}
function tplSL(ctx){with(ctx){var o="";
o+=`
<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

:root {
  --sl-df: 'Outfit', sans-serif;
  --sl-db: 'Plus Jakarta Sans', sans-serif;
  --sl-r:  16px;
  --sl-lg: 22px;
  --sl-g:  16px;
}

.slp { font-family: var(--sl-db); padding-bottom: 48px; max-width: 1280px; }

/* ── Top bar ── */
.sl-topbar {
  display:flex; align-items:center; justify-content:space-between;
  gap:12px; margin-bottom:var(--sl-g); flex-wrap:wrap;
  animation: sl-rise .4s ease both;
}
.sl-period { display:flex; background:var(--bg-secondary); border-radius:10px; padding:3px; gap:2px; }
.sl-ptb {
  padding:7px 15px; border-radius:8px; border:none; font-family:var(--sl-db);
  font-size:12px; font-weight:600; cursor:pointer; background:transparent;
  color:var(--text-muted); transition:all .16s; text-decoration:none; display:inline-block;
}
.sl-ptb.active { background:var(--bg-card); color:var(--text-primary); box-shadow:0 1px 4px rgba(0,0,0,.18); }
.sl-ptb:hover:not(.active) { color:var(--text-secondary); }

.sl-actions { display:flex; gap:8px; }
.sl-btn {
  display:inline-flex; align-items:center; gap:7px; padding:9px 18px;
  border-radius:11px; font-family:var(--sl-db); font-size:13px; font-weight:700;
  cursor:pointer; border:none; transition:all .18s; white-space:nowrap;
}
.sl-btn-primary {
  background:linear-gradient(135deg,#6366f1,#8b5cf6);
  color:#fff; box-shadow:0 4px 14px rgba(99,102,241,.3);
}
.sl-btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 22px rgba(99,102,241,.4); }
.sl-btn-secondary {
  background:var(--bg-card); border:1px solid var(--border); color:var(--text-secondary);
}
.sl-btn-secondary:hover { border-color:var(--border-light); color:var(--text-primary); background:var(--bg-card-hover); }

/* ── Stats ── */
.sl-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:var(--sl-g); margin-bottom:var(--sl-g); }
@media(max-width:900px){
  .sl-stats { grid-template-columns:repeat(2,1fr); }
}

.sl-st {
  background:var(--bg-card); border:1px solid var(--border); border-radius:var(--sl-lg);
  padding:22px 22px 18px; position:relative; overflow:hidden;
  transition:transform .2s,box-shadow .2s,border-color .2s;
  animation:sl-rise .5s ease both; cursor:default;
}
.sl-st:nth-child(1){animation-delay:.08s} .sl-st:nth-child(2){animation-delay:.13s} .sl-st:nth-child(3){animation-delay:.18s} .sl-st:nth-child(4){animation-delay:.23s}
.sl-st:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(0,0,0,.2); border-color:var(--border-light); }
.sl-st::before { content:''; position:absolute; width:120px; height:120px; border-radius:50%; top:-30px; right:-30px; pointer-events:none; }
.sl-st1::before{background:rgba(99,102,241,.16)} .sl-st2::before{background:rgba(6,182,212,.14)} .sl-st3::before{background:rgba(16,185,129,.14)} .sl-st4::before{background:rgba(245,158,11,.16)}
.sl-st::after { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; opacity:0; transition:opacity .2s; }
.sl-st:hover::after{opacity:1}
.sl-st1::after{background:linear-gradient(90deg,#6366f1,#a855f7)}
.sl-st2::after{background:linear-gradient(90deg,#06b6d4,#6366f1)}
.sl-st3::after{background:linear-gradient(90deg,#10b981,#06b6d4)}
.sl-st4::after{background:linear-gradient(90deg,#f59e0b,#f97316)}

.sl-sth { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; }
.sl-sti { width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:19px; }
.sl-stv { font-family:var(--sl-df); font-size:30px; font-weight:800; color:var(--text-primary); line-height:1; letter-spacing:-.5px; }
.sl-stv .du { font-size:14px; color:var(--text-muted); font-weight:500; font-family:var(--sl-db); }
.sl-stl { font-size:12px; color:var(--text-muted); margin-top:6px; font-weight:500; }

/* ── Card ── */
.sl-card {
  background:var(--bg-card); border:1px solid var(--border); border-radius:var(--sl-lg);
  padding:22px; margin-bottom:var(--sl-g); animation:sl-rise .5s .25s ease both;
}
.sl-card-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; gap:12px; flex-wrap:wrap; }
.sl-card-t { font-family:var(--sl-df); font-size:15px; font-weight:700; color:var(--text-primary); letter-spacing:-.2px; }
.sl-card-meta { font-size:12px; color:var(--text-muted); font-weight:600; }

/* ── Session rows ── */
.sl-row-hd {
  display:grid; grid-template-columns:100px 1fr 90px 1fr 44px;
  gap:8px; padding:0 4px 10px;
  border-bottom:1px solid var(--border);
  font-size:11px; font-weight:700; color:var(--text-muted);
  text-transform:uppercase; letter-spacing:.8px;
}
.sl-row {
  display:grid; grid-template-columns:100px 1fr 90px 1fr 44px;
  gap:8px; padding:11px 4px;
  border-bottom:1px solid var(--border);
  align-items:center;
  transition:background .12s, border-radius .12s, padding .12s;
}
.sl-row:last-child { border-bottom:none; }
.sl-row:hover { background:var(--bg-secondary); border-radius:12px; padding-left:12px; padding-right:12px; }

@media(max-width:680px){
  .sl-row-hd { display:none; }
  .sl-row {
    display:grid;
    grid-template-columns:1fr auto;
    grid-template-rows:auto auto auto;
    grid-template-areas:"date del" "subj del" "meta del";
    gap:3px 12px;
    background:var(--bg-secondary); border:1px solid var(--border) !important;
    border-radius:14px; padding:13px 14px !important; margin-bottom:8px;
  }
  .sl-row:last-child{ margin-bottom:0; }
  .sl-date{grid-area:date;}
  .sl-subj{grid-area:subj;}
  .sl-dur{grid-area:meta;}
  .sl-notes{display:none;}
  .sl-del{grid-area:del;display:flex;align-items:center;}
}

.sl-date { font-size:12px; color:var(--text-muted); }
.sl-date strong { font-size:13px; font-weight:600; color:var(--text-primary); display:block; }
.sl-subj { display:flex; align-items:center; gap:8px; font-size:13px; font-weight:600; color:var(--text-primary); overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
.sl-dot { width:9px; height:9px; border-radius:50%; flex-shrink:0; display:inline-block; }
.sl-dur { font-family:var(--sl-df); font-weight:700; color:var(--accent); font-size:14px; white-space:nowrap; }
.sl-notes-txt { font-size:12px; color:var(--text-muted); overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
.sl-del button {
  background:rgba(239,68,68,.1); color:#ef4444; border:none;
  border-radius:9px; padding:7px 9px; cursor:pointer; transition:all .15s; font-size:14px;
}
.sl-del button:hover { background:rgba(239,68,68,.22); transform:scale(1.08); }

/* ── Empty ── */
.sl-empty { text-align:center; padding:52px 20px; }
.sl-empty .sl-ei { font-size:48px; margin-bottom:14px; }
.sl-empty h3 { font-size:15px; font-weight:700; color:var(--text-secondary); margin-bottom:6px; }
.sl-empty p { font-size:13px; color:var(--text-muted); }

/* ── Modal ── */
.sl-modal-ov {
  position:fixed; inset:0; background:rgba(0,0,0,.6); backdrop-filter:blur(6px);
  z-index:9990; display:flex; align-items:center; justify-content:center;
  padding:16px; opacity:0; pointer-events:none; transition:opacity .2s;
}
.sl-modal-ov.active { opacity:1; pointer-events:auto; }
.sl-modal {
  background:var(--bg-card); border:1px solid rgba(99,102,241,.22);
  border-radius:24px; padding:28px; width:100%; max-width:460px;
  box-shadow:0 32px 80px rgba(0,0,0,.5);
  transform:scale(.94) translateY(14px);
  transition:transform .28s cubic-bezier(.34,1.3,.64,1);
  max-height:90vh; overflow-y:auto;
}
.sl-modal-ov.active .sl-modal { transform:scale(1) translateY(0); }

.sl-modal-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
.sl-modal-title { font-family:var(--sl-df); font-size:17px; font-weight:800; color:var(--text-primary); display:flex; align-items:center; gap:10px; }
.sl-modal-close { background:var(--bg-secondary); border:1px solid var(--border); border-radius:9px; color:var(--text-muted); font-size:14px; padding:5px 10px; cursor:pointer; transition:all .15s; }
.sl-modal-close:hover { color:var(--text-primary); border-color:var(--border-light); }

.sl-fg { margin-bottom:16px; }
.sl-fg label { display:block; font-size:11px; font-weight:700; color:var(--text-muted); letter-spacing:.6px; text-transform:uppercase; margin-bottom:7px; }
.sl-inp {
  width:100%; background:var(--bg-secondary); border:1px solid var(--border);
  border-radius:11px; padding:11px 14px; font-family:var(--sl-db);
  font-size:13px; color:var(--text-primary); transition:border-color .15s, box-shadow .15s;
  outline:none; box-sizing:border-box;
}
.sl-inp:focus { border-color:rgba(99,102,241,.5); box-shadow:0 0 0 3px rgba(99,102,241,.08); }
.sl-fg2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

/* Duration quick picker */
.sl-dur-picks { display:flex; gap:7px; flex-wrap:wrap; }
.sl-dpick {
  padding:6px 13px; border-radius:8px; border:1px solid var(--border);
  background:var(--bg-secondary); font-size:12px; font-weight:600;
  color:var(--text-muted); cursor:pointer; transition:all .15s;
}
.sl-dpick:hover, .sl-dpick.active {
  background:rgba(99,102,241,.12); border-color:rgba(99,102,241,.35); color:var(--accent);
}

.sl-alert { padding:10px 14px; border-radius:10px; font-size:13px; font-weight:600; margin-bottom:16px; display:none; }
.sl-alert.success { background:rgba(16,185,129,.1); border:1px solid rgba(16,185,129,.2); color:#10b981; }
.sl-alert.error   { background:rgba(239,68,68,.1);  border:1px solid rgba(239,68,68,.2);  color:#ef4444; }

.sl-save-btn {
  width:100%; background:linear-gradient(135deg,#6366f1,#8b5cf6);
  color:#fff; border:none; border-radius:12px; padding:14px;
  font-family:var(--sl-db); font-size:14px; font-weight:700;
  cursor:pointer; transition:all .18s; box-shadow:0 4px 14px rgba(99,102,241,.3);
  display:flex; align-items:center; justify-content:center; gap:8px; margin-top:4px;
}
.sl-save-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 24px rgba(99,102,241,.4); }
.sl-save-btn:disabled { opacity:.6; cursor:not-allowed; }

/* ── No subjects warning ── */
.sl-warn {
  background:rgba(245,158,11,.08); border:1px solid rgba(245,158,11,.2);
  border-radius:14px; padding:14px 18px; font-size:13px; color:#f59e0b;
  font-weight:600; margin-bottom:var(--sl-g); display:flex; align-items:center; gap:10px;
}

/* ════════════════════════════════
   CUSTOM TOAST / CONFIRM POPUP
════════════════════════════════ */
.sl-toast-ov {
  position:fixed; inset:0; z-index:99999;
  display:flex; align-items:flex-end; justify-content:center;
  padding:0 16px 32px;
  pointer-events:none; opacity:0;
  transition:opacity .22s ease;
}
.sl-toast-ov.show { opacity:1; pointer-events:auto; }

.sl-toast {
  background:var(--bg-card); border:1px solid rgba(99,102,241,.2);
  border-radius:20px; padding:20px 22px 18px;
  width:100%; max-width:400px;
  box-shadow:0 24px 60px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.04);
  transform:translateY(28px) scale(.96);
  transition:transform .28s cubic-bezier(.34,1.3,.64,1);
  position:relative;
}
.sl-toast-ov.show .sl-toast { transform:translateY(0) scale(1); }

.sl-toast::before {
  content:''; position:absolute; top:0; left:20%; right:20%; height:1px;
  background:linear-gradient(90deg,transparent,rgba(99,102,241,.7),rgba(168,85,247,.6),transparent);
  border-radius:99px;
}
.sl-toast-icon { font-size:28px; margin-bottom:10px; }
.sl-toast-title { font-family:var(--sl-df); font-size:16px; font-weight:800; color:var(--text-primary); margin-bottom:5px; }
.sl-toast-msg   { font-size:13px; color:var(--text-muted); line-height:1.5; margin-bottom:18px; }
.sl-toast-btns  { display:flex; gap:8px; }
.sl-toast-btn {
  flex:1; padding:11px; border-radius:11px; font-family:var(--sl-db);
  font-size:13px; font-weight:700; cursor:pointer; border:none; transition:all .16s;
  text-align:center;
}
.sl-toast-btn.primary {
  background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff;
  box-shadow:0 4px 12px rgba(99,102,241,.3);
}
.sl-toast-btn.primary:hover { transform:translateY(-2px); box-shadow:0 6px 18px rgba(99,102,241,.4); }
.sl-toast-btn.danger {
  background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff;
  box-shadow:0 4px 12px rgba(239,68,68,.3);
}
.sl-toast-btn.danger:hover { transform:translateY(-2px); box-shadow:0 6px 18px rgba(239,68,68,.4); }
.sl-toast-btn.secondary {
  background:var(--bg-secondary); border:1px solid var(--border); color:var(--text-secondary);
}
.sl-toast-btn.secondary:hover { color:var(--text-primary); border-color:var(--border-light); }

/* Simple info toast (no buttons) */
.sl-snack-ov {
  position:fixed; bottom:28px; left:50%; transform:translateX(-50%) translateY(80px);
  z-index:99999; transition:transform .3s cubic-bezier(.34,1.3,.64,1), opacity .25s ease;
  opacity:0; pointer-events:none;
}
.sl-snack-ov.show { transform:translateX(-50%) translateY(0); opacity:1; pointer-events:auto; }
.sl-snack {
  background:#1e1e2e; border:1px solid rgba(99,102,241,.25);
  border-radius:99px; padding:10px 20px;
  font-size:13px; font-weight:700; color:var(--text-primary);
  white-space:nowrap; box-shadow:0 8px 28px rgba(0,0,0,.4);
  display:flex; align-items:center; gap:8px;
}

/* ════════════════════════════════
   LIVE SESSION TIMER CARD
════════════════════════════════ */
.ls-card {
  background:var(--bg-card); border:1px solid var(--border); border-radius:var(--sl-lg);
  padding:22px; margin-bottom:var(--sl-g); animation:sl-rise .5s .2s ease both;
  position:relative; overflow:hidden;
  transition:border-color .4s ease, box-shadow .4s ease;
}
.ls-card.active-session {
  border-color:rgba(34,197,94,.4);
  box-shadow:0 0 0 1px rgba(34,197,94,.07), 0 16px 40px rgba(0,0,0,.2);
  background:linear-gradient(160deg, var(--bg-card) 70%, rgba(34,197,94,.04) 100%);
}
.ls-card::before {
  content:''; position:absolute; inset:0; pointer-events:none;
  background:radial-gradient(ellipse at 0% 0%, rgba(99,102,241,.05) 0%, transparent 55%);
}

/* Idle */
.ls-idle { display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
.ls-idle-left { display:flex; align-items:center; gap:14px; }
.ls-idle-icon {
  width:50px; height:50px; border-radius:15px;
  background:linear-gradient(135deg,rgba(99,102,241,.15),rgba(34,197,94,.1));
  border:1px solid rgba(99,102,241,.15);
  display:flex; align-items:center; justify-content:center; font-size:23px; flex-shrink:0;
}
.ls-idle-title { font-family:var(--sl-df); font-size:15px; font-weight:700; color:var(--text-primary); }
.ls-idle-sub { font-size:12px; color:var(--text-muted); margin-top:3px; }
.ls-start-btn {
  display:inline-flex; align-items:center; gap:8px;
  padding:12px 24px; border-radius:13px;
  background:linear-gradient(135deg,#22c55e,#16a34a);
  color:#fff; border:none; font-family:var(--sl-db); font-size:14px; font-weight:700;
  cursor:pointer; transition:all .2s; box-shadow:0 4px 18px rgba(34,197,94,.38);
  white-space:nowrap; position:relative; overflow:hidden;
}
.ls-start-btn::after {
  content:''; position:absolute; inset:0;
  background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,.15),transparent 70%);
  transform:skewX(-15deg) translateX(-100%); transition:transform .5s ease;
}
.ls-start-btn:hover::after { transform:skewX(-15deg) translateX(200%); }
.ls-start-btn:hover { transform:translateY(-2px); box-shadow:0 8px 26px rgba(34,197,94,.48); }

/* Running state */
.ls-running { display:none; }
.ls-running.visible { display:block; animation:sl-rise .35s ease both; }
.ls-idle.hidden { display:none; }

/* Top row */
.ls-running-top {
  display:flex; align-items:center; justify-content:space-between;
  gap:10px; margin-bottom:20px; flex-wrap:wrap;
}
.ls-live-badge {
  display:inline-flex; align-items:center; gap:6px;
  background:rgba(34,197,94,.12); border:1px solid rgba(34,197,94,.3);
  border-radius:99px; padding:5px 13px;
  font-size:11px; font-weight:800; color:#22c55e;
  text-transform:uppercase; letter-spacing:1px; flex-shrink:0;
}
.ls-live-dot {
  width:7px; height:7px; border-radius:50%; background:#22c55e;
  animation:ls-blink 1.2s ease-in-out infinite;
}
@keyframes ls-blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.6)} }

/* Subject row */
.ls-sub-row {
  display:flex; align-items:center; gap:8px;
  background:var(--bg-secondary); border:1px solid var(--border);
  border-radius:11px; padding:8px 14px; flex:1; min-width:0; max-width:240px;
  transition:border-color .2s;
}
.ls-sub-row:focus-within { border-color:rgba(99,102,241,.4); }
.ls-sub-dot { width:9px; height:9px; border-radius:50%; flex-shrink:0; background:var(--border); transition:background .2s; }
.ls-sub-select {
  flex:1; background:transparent; border:none; outline:none;
  font-family:var(--sl-db); font-size:13px; font-weight:600;
  color:var(--text-primary); min-width:0;
}

/* Ring timer */
.ls-timer-wrap { text-align:center; padding:4px 0 18px; }
.ls-timer-ring { position:relative; width:200px; height:200px; margin:0 auto 10px; }
.ls-timer-ring svg { transform:rotate(-90deg); }
.ls-timer-inner {
  position:absolute; inset:0; display:flex;
  flex-direction:column; align-items:center; justify-content:center;
}
.ls-timer-display {
  font-family:var(--sl-df); font-size:clamp(32px,8vw,46px); font-weight:900;
  letter-spacing:-3px; line-height:1; font-variant-numeric:tabular-nums;
  background:linear-gradient(135deg,#818cf8 0%,#c084fc 45%,#38bdf8 100%);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  transition:all .3s ease;
}
.ls-timer-paused .ls-timer-display {
  background:linear-gradient(135deg,#f59e0b,#fbbf24) !important;
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
}
.ls-timer-sub {
  font-size:11px; color:var(--text-muted); font-weight:600;
  margin-top:6px; letter-spacing:.5px; text-transform:uppercase;
}

/* Progress bar */
.ls-elapsed-bar { height:5px; background:var(--bg-secondary); border-radius:99px; overflow:hidden; margin-bottom:18px; }
.ls-elapsed-fill {
  height:100%; border-radius:99px;
  background:linear-gradient(90deg,#6366f1,#a855f7,#38bdf8,#22c55e);
  background-size:300% 100%; animation:ls-flow 4s linear infinite;
  transition:width .8s cubic-bezier(.4,0,.2,1); width:0%;
}
@keyframes ls-flow { 0%{background-position:0%} 100%{background-position:300%} }
.ls-elapsed-fill.paused { animation:none; opacity:.55; }

/* Controls */
.ls-controls { display:grid; grid-template-columns:1fr 2fr; gap:10px; }
@media(max-width:380px){ .ls-controls { grid-template-columns:1fr; } }
.ls-stop-btn {
  display:flex; align-items:center; justify-content:center; gap:8px;
  padding:14px; border-radius:13px;
  background:linear-gradient(135deg,#ef4444,#dc2626);
  color:#fff; border:none; font-family:var(--sl-db); font-size:14px; font-weight:700;
  cursor:pointer; transition:all .18s; box-shadow:0 4px 14px rgba(239,68,68,.3);
}
.ls-stop-btn:hover { transform:translateY(-2px); box-shadow:0 8px 22px rgba(239,68,68,.4); }
.ls-pause-btn {
  display:flex; align-items:center; justify-content:center; gap:7px;
  padding:14px; border-radius:13px; border:1px solid var(--border);
  background:var(--bg-secondary); color:var(--text-secondary);
  font-family:var(--sl-db); font-size:14px; font-weight:700;
  cursor:pointer; transition:all .18s;
}
.ls-pause-btn:hover { border-color:var(--border-light); color:var(--text-primary); }
.ls-pause-btn.paused { background:rgba(245,158,11,.1); border-color:rgba(245,158,11,.35); color:#f59e0b; }

/* Fullscreen toggle */
.ls-fs-btn {
  width:34px; height:34px; border-radius:10px; border:1px solid var(--border);
  background:var(--bg-secondary); color:var(--text-secondary); font-size:15px;
  cursor:pointer; display:flex; align-items:center; justify-content:center;
  transition:all .15s; flex-shrink:0;
}
.ls-fs-btn:hover { border-color:var(--border-light); color:var(--text-primary); }
.ls-timer-ring svg { width:100%; height:100%; }
#lsCard:fullscreen, #lsCard.ls-fs-active {
  display:flex !important; flex-direction:column; align-items:center; justify-content:center;
  position:fixed; inset:0; z-index:999999;
  width:100vw; height:100vh; height:100dvh; max-width:none; background:var(--bg-primary);
  border-radius:0; border:none; padding:24px; box-sizing:border-box; overflow:auto;
}
body.ls-fs-lock { overflow:hidden; }
#lsCard:fullscreen .ls-idle, #lsCard.ls-fs-active .ls-idle { display:none !important; }
#lsCard:fullscreen .ls-running, #lsCard.ls-fs-active .ls-running { width:100%; max-width:460px; }
#lsCard:fullscreen .ls-running-top, #lsCard.ls-fs-active .ls-running-top { margin-bottom:28px; }
#lsCard:fullscreen .ls-timer-ring, #lsCard.ls-fs-active .ls-timer-ring { width:min(78vw,340px); height:min(78vw,340px); }
#lsCard:fullscreen .ls-timer-display, #lsCard.ls-fs-active .ls-timer-display { font-size:clamp(38px,11vw,64px); }

/* Save modal */
.ls-notes-inp { resize:vertical; }

@keyframes sl-rise { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
</style>

<div class="slp">

`;
if(PHP.T(abuseLocked)){
o+=`
<div class="sl-warn" id="slLockBanner" style="background:rgba(239,68,68,.1);border-color:rgba(239,68,68,.3);color:#ef4444">
  🔒 Your account is <strong>locked by the system</strong> until `;
o+=PHP.s(PHP.date('M j, g:i A', PHP.strtotime(abuseLockedUntil)));
o+=` due to repeated unrealistic session entries — logging is disabled until then. Contact an admin if you think this is a mistake.
</div>
`;
}
o+=`

`;
if(!PHP.T(subjectsList)){
o+=`
<div class="sl-warn">
  ⚠️ You need to <a href="`;
o+=PHP.s(SITE_URL);
o+=`/subjects" style="color:#f59e0b;text-decoration:underline">add subjects</a> before logging study sessions.
</div>
`;
}
o+=`

<!-- ── Top bar ── -->
<div class="sl-topbar">
  <div class="sl-period">
    <a href="#/study-log?period=week"  class="sl-ptb `;
o+=PHP.s(period==='week' ?'active':'');
o+=`">Week</a>
    <a href="#/study-log?period=month" class="sl-ptb `;
o+=PHP.s(period==='month'?'active':'');
o+=`">Month</a>
    <a href="#/study-log?period=year"  class="sl-ptb `;
o+=PHP.s(period==='year' ?'active':'');
o+=`">Year</a>
    <a href="#/study-log?period=all"   class="sl-ptb `;
o+=PHP.s(period==='all'  ?'active':'');
o+=`">All Time</a>
  </div>
  <div class="sl-actions">
    <a href="`;
o+=PHP.s(SITE_URL);
o+=`/pomodoro" id="slPomodoroLink" class="sl-btn sl-btn-secondary" `;
o+=PHP.s(abuseLocked?'style="pointer-events:none;opacity:.5" title="Locked by system"':'');
o+=`>
      ⏱️ Pomodoro
    </a>
    <button id="slLogSessionBtn" class="sl-btn sl-btn-primary" onclick="slOpenAddModal()" `;
o+=PHP.s(abuseLocked?'disabled title="Locked by system"':'');
o+=`>
      ＋ Log Session
    </button>
  </div>
</div>

<!-- ── Stats ── -->
<div class="sl-stats" id="slStatsWrap">`;
o+=PHP.s(frag['statsHtml']);
o+=`</div>

<!-- ── Spaced Repetition Tracker ── -->
<div class="sl-card" id="slSrCard">
  <div id="slSrWrap">`;
o+=PHP.s(frag['srHtml']);
o+=`</div>
</div>

<!-- ── Live Session Timer ── -->
<div class="ls-card" id="lsCard">

  <!-- IDLE state -->
  <div class="ls-idle" id="lsIdle">
    <div class="ls-idle-left">
      <div class="ls-idle-icon">🎯</div>
      <div>
        <div class="ls-idle-title">Live Study Session</div>
        <div class="ls-idle-sub">Start a timer — auto-saves when you stop</div>
      </div>
    </div>
    <button class="ls-start-btn" onclick="lsOpen()">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
      Start Session
    </button>
  </div>

  <!-- RUNNING state -->
  <div class="ls-running" id="lsRunning">

    <!-- Top: Live badge + subject picker -->
    <div class="ls-running-top">
      <div class="ls-live-badge"><span class="ls-live-dot"></span> Live</div>
      <div class="ls-sub-row" style="max-width:240px">
        <span class="ls-sub-dot" id="lsSubDot"></span>
        <select id="ls_subject_run" class="ls-sub-select" onchange="lsSubjectChanged()">
          <option value="">— Select subject —</option>
          `;
for(var a11=PHP.arr(subjectsList),i_a11=0,sub;i_a11<a11.length&&((sub=a11[i_a11]),true);i_a11++){
o+=`
          <option value="`;
o+=PHP.s(sub['id']);
o+=`" data-color="`;
o+=PHP.s(E(sub['color']));
o+=`">
            `;
o+=PHP.s(E(sub['name']));
o+=`
          </option>
          `;
}
o+=`
        </select>
      </div>
      <button type="button" class="ls-fs-btn" id="lsFsBtn" onclick="lsToggleFullscreen()" title="Fullscreen">⛶</button>
    </div>

    <!-- SVG Ring Timer -->
    <div class="ls-timer-wrap">
      <div class="ls-timer-ring">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <!-- Background ring -->
          <circle cx="100" cy="100" r="88" fill="none" stroke="var(--bg-secondary)" stroke-width="8"/>
          <!-- Progress ring (animated via JS) -->
          <circle id="lsRingProgress" cx="100" cy="100" r="88"
            fill="none" stroke="url(#ls-grad)" stroke-width="8"
            stroke-linecap="round"
            stroke-dasharray="552.9"
            stroke-dashoffset="552.9"
            style="transform:rotate(-90deg);transform-origin:center;transition:stroke-dashoffset .8s ease"/>
          <defs>
            <linearGradient id="ls-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#6366f1"/>
              <stop offset="50%" stop-color="#a855f7"/>
              <stop offset="100%" stop-color="#22c55e"/>
            </linearGradient>
          </defs>
        </svg>
        <div class="ls-timer-inner">
          <div class="ls-timer-display" id="lsDisplay">00:00:00</div>
          <div class="ls-timer-sub" id="lsSubLabel">Ready</div>
        </div>
      </div>
    </div>

    <!-- Elapsed bar -->
    <div class="ls-elapsed-bar">
      <div class="ls-elapsed-fill" id="lsElapsedBar"></div>
    </div>

    <!-- Controls -->
    <div class="ls-controls">
      <button class="ls-pause-btn" id="lsPauseBtn" onclick="lsTogglePause()">⏸ Pause</button>
      <button class="ls-stop-btn" onclick="lsStop()">⏹ Stop & Save</button>
    </div>
    <div style="text-align:center;margin-top:10px">
      <button onclick="lsDiscardConfirm()" style="background:none;border:none;color:var(--text-muted);font-size:12px;font-weight:600;cursor:pointer;padding:4px 8px;border-radius:6px;transition:color .15s" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='var(--text-muted)'">
        🗑 Discard &amp; Reset
      </button>
    </div>

  </div>
</div>

<!-- ════ CUSTOM TOAST POPUP ════ -->
<div class="sl-toast-ov" id="slToastOv">
  <div class="sl-toast" id="slToast">
    <div class="sl-toast-icon" id="slToastIcon">⚠️</div>
    <div class="sl-toast-title" id="slToastTitle">Are you sure?</div>
    <div class="sl-toast-msg"   id="slToastMsg"></div>
    <div class="sl-toast-btns" id="slToastBtns"></div>
  </div>
</div>

<!-- Simple snack bar -->
<div class="sl-snack-ov" id="slSnackOv">
  <div class="sl-snack" id="slSnackMsg">✅ Done!</div>
</div>

<!-- ════ LIVE SAVE MODAL ════ -->
<div class="sl-modal-ov" id="lsSaveModal">
  <div class="sl-modal" style="max-width:400px">
    <div class="sl-modal-hd">
      <div class="sl-modal-title">💾 Save Session</div>
      <button class="sl-modal-close" onclick="lsCancelSave()">✕</button>
    </div>
    <div id="lsSaveMsg" class="sl-alert"></div>

    <div style="background:var(--bg-secondary);border-radius:14px;padding:16px;margin-bottom:18px;text-align:center">
      <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px">Session Duration</div>
      <div style="font-family:var(--sl-df);font-size:36px;font-weight:900;letter-spacing:-2px;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text" id="lsSaveDuration">0h 0m</div>
    </div>

    <div class="sl-fg">
      <label>Subject *</label>
      <select id="ls_subject_save" class="sl-inp">
        <option value="">— Select subject —</option>
        `;
for(var a12=PHP.arr(subjectsList),i_a12=0,sub;i_a12<a12.length&&((sub=a12[i_a12]),true);i_a12++){
o+=`
        <option value="`;
o+=PHP.s(sub['id']);
o+=`">`;
o+=PHP.s(E(sub['name']));
o+=`</option>
        `;
}
o+=`
      </select>
    </div>

    <div class="sl-fg">
      <label>Notes <span style="text-transform:none;letter-spacing:0;font-weight:400">(optional)</span></label>
      <textarea id="ls_notes_save" class="sl-inp ls-notes-inp" rows="2" placeholder="What did you study?"></textarea>
    </div>

    <div style="display:flex;gap:10px">
      <button onclick="lsCancelSave()" style="flex:1;padding:12px;border-radius:12px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-secondary);font-family:var(--sl-db);font-size:13px;font-weight:700;cursor:pointer">Discard</button>
      <button id="lsSaveBtn" onclick="lsConfirmSave()" class="sl-save-btn" style="flex:2;margin-top:0">Save Session</button>
    </div>
  </div>
</div>


<!-- ── Session log ── -->
<div class="sl-card">
  <div id="slSessionsWrap">`;
o+=PHP.s(frag['sessionsHtml']);
o+=`</div>
</div>

</div><!-- .slp -->


<!-- ════ LOG SESSION MODAL ════ -->
<div class="sl-modal-ov" id="slAddModal">
  <div class="sl-modal">
    <div class="sl-modal-hd">
      <div class="sl-modal-title">➕ Log Study Session</div>
      <button class="sl-modal-close" onclick="document.getElementById('slAddModal').classList.remove('active')">✕</button>
    </div>
    <div id="slMsg" class="sl-alert"></div>

    <div class="sl-fg">
      <label>Subject *</label>
      <select id="ses_subject" class="sl-inp">
        <option value="">— Select subject —</option>
        `;
for(var a13=PHP.arr(subjectsList),i_a13=0,sub;i_a13<a13.length&&((sub=a13[i_a13]),true);i_a13++){
o+=`
        <option value="`;
o+=PHP.s(sub['id']);
o+=`">`;
o+=PHP.s(E(sub['name']));
o+=`</option>
        `;
}
o+=`
      </select>
    </div>

    <div class="sl-fg">
      <label>Date</label>
      <input type="date" id="ses_date" class="sl-inp" value="`;
o+=PHP.s(PHP.date('Y-m-d'));
o+=`">
    </div>

    <div class="sl-fg">
      <label>Quick Duration</label>
      <div class="sl-dur-picks">
        <button class="sl-dpick" onclick="slSetDur(0,30,this)">30m</button>
        <button class="sl-dpick" onclick="slSetDur(1,0,this)">1h</button>
        <button class="sl-dpick" onclick="slSetDur(1,30,this)">1h 30m</button>
        <button class="sl-dpick" onclick="slSetDur(2,0,this)">2h</button>
        <button class="sl-dpick" onclick="slSetDur(2,30,this)">2h 30m</button>
        <button class="sl-dpick" onclick="slSetDur(3,0,this)">3h</button>
      </div>
    </div>

    <div class="sl-fg2">
      <div class="sl-fg" style="margin-bottom:0">
        <label>Hours</label>
        <input type="number" id="ses_hours" class="sl-inp" min="0" max="24" value="0">
      </div>
      <div class="sl-fg" style="margin-bottom:0">
        <label>Minutes</label>
        <input type="number" id="ses_minutes" class="sl-inp" min="0" max="59" value="30">
      </div>
    </div>
    <div style="margin-bottom:16px"></div>

    <div class="sl-fg">
      <label>Notes <span style="text-transform:none;letter-spacing:0;font-weight:400">(optional)</span></label>
      <textarea id="ses_notes" class="sl-inp" rows="2" style="resize:vertical" placeholder="What did you study?"></textarea>
    </div>

    <button id="sesSaveBtn" class="sl-save-btn" onclick="slSave()">Save Session</button>
  </div>
</div>


<script>
// ══════════════════════════════════════
// CUSTOM TOAST / SNACK HELPERS
// ══════════════════════════════════════
function slToast(opts) {
  // opts: { icon, title, msg, buttons:[{label,cls,cb}] }
  document.getElementById('slToastIcon').textContent  = opts.icon  || '💬';
  document.getElementById('slToastTitle').textContent = opts.title || '';
  document.getElementById('slToastMsg').textContent   = opts.msg   || '';
  var btns = document.getElementById('slToastBtns');
  btns.innerHTML = '';
  (opts.buttons || []).forEach(function(b){
    var el = document.createElement('button');
    el.className = 'sl-toast-btn ' + (b.cls || 'secondary');
    el.textContent = b.label;
    el.onclick = function(){
      document.getElementById('slToastOv').classList.remove('show');
      if (b.cb) b.cb();
    };
    btns.appendChild(el);
  });
  document.getElementById('slToastOv').classList.add('show');
}

function slSnack(msg, duration) {
  var el = document.getElementById('slSnackMsg');
  el.textContent = msg;
  var ov = document.getElementById('slSnackOv');
  ov.classList.add('show');
  clearTimeout(ov._t);
  ov._t = setTimeout(function(){ ov.classList.remove('show'); }, duration || 2800);
}


// ══════════════════════════════════════
// LIVE SESSION TIMER
// ══════════════════════════════════════
var LS = {
  running:false, paused:false, startTime:null,
  elapsed:0, interval:null, MAX_SECS:3600,
};
var LS_CIRC = 552.9; // 2π × 88

// Restore from sessionStorage
(function(){
  try {
    var saved = sessionStorage.getItem('ls_state');
    if (!saved) return;
    var s = JSON.parse(saved);
    if (!s.running) return;
    // Validate — if saved timestamp is more than 12h ago, discard
    var now = Date.now();
    if (s.savedAt && (now - s.savedAt) > 43200000) {
      sessionStorage.removeItem('ls_state'); return;
    }
    LS.running = true;
    LS.paused  = s.paused || false;
    // Recalculate elapsed: saved elapsed + time since last save (if was running)
    LS.elapsed = s.elapsed || 0;
    if (!s.paused && s.savedAt) {
      LS.elapsed += Math.floor((now - s.savedAt) / 1000);
    }
    LS.startTime = LS.paused ? null : Date.now();
    window._lsRestoreSubject = s.subjectId || '';
  } catch(e){ sessionStorage.removeItem('ls_state'); }
})();

function lsSaveSS() {
  try {
    // Save current accumulated elapsed (exclude current running segment — recalc on restore)
    var snapElapsed = LS.elapsed;
    // If running (not paused), snapshot elapsed up to now
    if (!LS.paused && LS.startTime) {
      snapElapsed = LS.elapsed + Math.floor((Date.now() - LS.startTime) / 1000);
    }
    sessionStorage.setItem('ls_state', JSON.stringify({
      running:   LS.running,
      paused:    LS.paused,
      elapsed:   snapElapsed,
      savedAt:   Date.now(),
      subjectId: document.getElementById('ls_subject_run').value,
    }));
  } catch(e){}
}

function lsGetTotalSecs() {
  var t = LS.elapsed;
  if (LS.running && !LS.paused && LS.startTime)
    t += Math.floor((Date.now() - LS.startTime) / 1000);
  return t;
}

function lsFmt(secs) {
  var h=Math.floor(secs/3600), m=Math.floor((secs%3600)/60), s=secs%60;
  return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}

function lsSubjectChanged() {
  var sel = document.getElementById('ls_subject_run');
  var opt = sel.options[sel.selectedIndex];
  var col = (opt && opt.dataset.color) ? opt.dataset.color : 'var(--border)';
  document.getElementById('lsSubDot').style.background = col;
  lsUpdateDisplay();
}

function lsUpdateDisplay() {
  var total = lsGetTotalSecs();
  document.getElementById('lsDisplay').textContent = lsFmt(total);

  // Ring progress — fills over 1 hour
  var pct    = Math.min(1, total / LS.MAX_SECS);
  var offset = LS_CIRC * (1 - pct);
  var ring   = document.getElementById('lsRingProgress');
  if (ring) ring.setAttribute('stroke-dashoffset', offset);

  // Elapsed bar
  document.getElementById('lsElapsedBar').style.width = (pct * 100) + '%';

  // Subject label
  var sel = document.getElementById('ls_subject_run');
  var opt = sel.options[sel.selectedIndex];
  document.getElementById('lsSubLabel').textContent =
    (opt && opt.value) ? opt.text : 'Select a subject ↑';
}

function lsOpen() {
  LS.running = true; LS.paused = false;
  LS.elapsed = 0; LS.startTime = Date.now();
  document.getElementById('lsIdle').classList.add('hidden');
  document.getElementById('lsRunning').classList.add('visible');
  document.getElementById('lsCard').classList.add('active-session');
  lsUpdateDisplay();
  LS.interval = setInterval(function(){ lsUpdateDisplay(); lsSaveSS(); }, 1000);
  lsSaveSS();
}

// ── Fullscreen mode ──────────────────────────────────────────────
// Native Fullscreen API isn't reliable on mobile (iOS Safari doesn't
// support it on regular elements at all), so the CSS class below is
// the real "fullscreen" — requestFullscreen is just a bonus on top
// where the browser actually supports it (desktop / Android Chrome).
function lsSafeFsCall(fn, ctx) {
  try {
    var p = fn && fn.call(ctx);
    if (p && typeof p.catch === 'function') p.catch(function(){});
  } catch (e) {}
}
function lsSyncFsBtn() {
  var isActive = document.getElementById('lsCard').classList.contains('ls-fs-active');
  var btn = document.getElementById('lsFsBtn');
  if (btn) btn.innerHTML = isActive ? '⤬' : '⛶';
}
function lsToggleFullscreen() {
  var card = document.getElementById('lsCard');
  if (!card.classList.contains('ls-fs-active')) {
    card.classList.add('ls-fs-active');
    document.body.classList.add('ls-fs-lock');
    lsSafeFsCall(card.requestFullscreen || card.webkitRequestFullscreen || card.msRequestFullscreen, card);
  } else {
    card.classList.remove('ls-fs-active');
    document.body.classList.remove('ls-fs-lock');
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      lsSafeFsCall(document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen, document);
    }
  }
  lsSyncFsBtn();
}
function lsFsChanged() {
  // Browser exited native fullscreen on its own (Esc, back gesture) — drop our overlay too
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    document.getElementById('lsCard').classList.remove('ls-fs-active');
    document.body.classList.remove('ls-fs-lock');
    lsSyncFsBtn();
  }
}
document.addEventListener('fullscreenchange', lsFsChanged);
document.addEventListener('webkitfullscreenchange', lsFsChanged);

function lsTogglePause() {
  var btn  = document.getElementById('lsPauseBtn');
  var run  = document.getElementById('lsRunning');
  var bar  = document.getElementById('lsElapsedBar');
  if (!LS.paused) {
    LS.elapsed += Math.floor((Date.now() - LS.startTime) / 1000);
    LS.startTime = null; LS.paused = true;
    clearInterval(LS.interval); LS.interval = null;
    btn.innerHTML = '▶ Resume'; btn.classList.add('paused');
    run.classList.add('ls-timer-paused');
    bar.classList.add('paused');
  } else {
    LS.startTime = Date.now(); LS.paused = false;
    btn.innerHTML = '⏸ Pause'; btn.classList.remove('paused');
    run.classList.remove('ls-timer-paused');
    bar.classList.remove('paused');
    LS.interval = setInterval(function(){ lsUpdateDisplay(); lsSaveSS(); }, 1000);
  }
  lsUpdateDisplay(); lsSaveSS();
}

function lsStop() {
  // Accumulate elapsed
  if (!LS.paused && LS.startTime) {
    LS.elapsed += Math.floor((Date.now() - LS.startTime) / 1000);
    LS.startTime = null;
  }
  clearInterval(LS.interval); LS.interval = null;

  var totalSecs = LS.elapsed;

  if (totalSecs < 60) {
    slToast({
      icon:'⚠️', title:'Too short!',
      msg:'Your session is less than 1 minute. Do you want to discard it?',
      buttons:[
        { label:'Keep Going', cls:'primary', cb: function(){
          // Resume
          LS.startTime = Date.now(); LS.paused = false;
          document.getElementById('lsPauseBtn').innerHTML = '⏸ Pause';
          document.getElementById('lsPauseBtn').classList.remove('paused');
          LS.interval = setInterval(function(){ lsUpdateDisplay(); lsSaveSS(); }, 1000);
        }},
        { label:'Discard', cls:'danger', cb: lsReset },
      ]
    });
    return;
  }

  // Show save modal
  var h = Math.floor(totalSecs/3600), m = Math.floor((totalSecs%3600)/60);
  document.getElementById('lsSaveDuration').textContent = h+'h '+m+'m';
  var runSub = document.getElementById('ls_subject_run').value;
  if (runSub) document.getElementById('ls_subject_save').value = runSub;
  document.getElementById('lsSaveMsg').style.display = 'none';
  document.getElementById('lsSaveModal').classList.add('active');
}

function lsDiscardConfirm() {
  var total = lsGetTotalSecs();
  var h = Math.floor(total/3600), m = Math.floor((total%3600)/60), s = total%60;
  var timeStr = h>0 ? h+'h '+m+'m' : m+'m '+s+'s';
  slToast({
    icon:'🗑️', title:'Discard session?',
    msg:'This will delete your '+timeStr+' session. Cannot be undone.',
    buttons:[
      { label:'Cancel',  cls:'secondary', cb: function(){} },
      { label:'Discard', cls:'danger',    cb: function(){ lsReset(); slSnack('Session discarded'); } },
    ]
  });
}

function lsCancelSave() {
  slToast({
    icon:'🗑️', title:'Discard session?',
    msg:'Your '+ lsFmt(LS.elapsed) +' session will be lost.',
    buttons:[
      { label:'Keep It', cls:'primary', cb: function(){
        document.getElementById('lsSaveModal').classList.add('active');
      }},
      { label:'Discard', cls:'danger', cb: function(){
        document.getElementById('lsSaveModal').classList.remove('active');
        lsReset();
      }},
    ]
  });
}

async function lsConfirmSave() {
  var subId = document.getElementById('ls_subject_save').value;
  if (!subId) {
    var m = document.getElementById('lsSaveMsg');
    m.className='sl-alert error'; m.textContent='⚠️ Please select a subject.';
    m.style.display='block'; return;
  }
  var totalSecs = LS.elapsed;
  var hours = Math.floor(totalSecs/3600);
  var mins  = Math.max(1, Math.floor((totalSecs%3600)/60));

  var btn = document.getElementById('lsSaveBtn');
  btn.disabled=true; btn.textContent='⏳ Saving...';

  try {
    var fd=new FormData();
    fd.append('action','add'); fd.append('subject_id',subId);
    fd.append('date', new Date().toISOString().split('T')[0]);
    fd.append('hours',hours); fd.append('minutes',mins);
    fd.append('notes', document.getElementById('ls_notes_save').value || '⏱️ Live session');

    var res  = await stFetch(location.href,{method:'POST',body:fd,headers:{'X-Requested-With':'XMLHttpRequest'}});
    var data = await res.json();

    if (data.success) {
      sessionStorage.removeItem('ls_state');
      document.getElementById('lsSaveModal').classList.remove('active');
      var pointsSuffix = data.points_earned > 0 ? ' +' + data.points_earned + ' 🏆' : '';
      var coinsSuffix = data.coins_earned > 0 ? ' +' + data.coins_earned + ' 🪙' : '';
      slSnack('✅ Session saved! ' + hours+'h '+mins+'m' + pointsSuffix + coinsSuffix);
      slApplyFragments(data);
      lsReset();
      btn.disabled=false; btn.textContent='Save Session';
    } else {
      var m=document.getElementById('lsSaveMsg');
      m.className='sl-alert error'; m.textContent='⚠️ '+data.message;
      m.style.display='block';
      btn.disabled=false; btn.textContent='Save Session';
    }
  } catch(e) {
    var m=document.getElementById('lsSaveMsg');
    m.className='sl-alert error'; m.textContent='⚠️ Network error.';
    m.style.display='block';
    btn.disabled=false; btn.textContent='Save Session';
  }
}

function lsReset() {
  clearInterval(LS.interval);
  LS.running=false; LS.paused=false; LS.elapsed=0; LS.startTime=null; LS.interval=null;
  document.getElementById('lsRunning').classList.remove('visible');
  document.getElementById('lsIdle').classList.remove('hidden');
  document.getElementById('lsCard').classList.remove('active-session');
  document.getElementById('lsDisplay').textContent='00:00:00';
  document.getElementById('lsElapsedBar').style.width='0%';
  var ring=document.getElementById('lsRingProgress');
  if(ring) ring.setAttribute('stroke-dashoffset', LS_CIRC);
  document.getElementById('lsPauseBtn').innerHTML='⏸ Pause';
  document.getElementById('lsPauseBtn').classList.remove('paused');
  document.getElementById('lsSubDot').style.background='var(--border)';
  document.getElementById('ls_notes_save').value='';
  sessionStorage.removeItem('ls_state');
}

// Restore if timer was running before page refresh
window.addEventListener('load', function(){
  if (!LS.running) return;
  document.getElementById('lsIdle').classList.add('hidden');
  document.getElementById('lsRunning').classList.add('visible');
  document.getElementById('lsCard').classList.add('active-session');
  if (window._lsRestoreSubject) {
    document.getElementById('ls_subject_run').value = window._lsRestoreSubject;
    lsSubjectChanged();
  }
  if (LS.paused) {
    document.getElementById('lsPauseBtn').innerHTML = '▶ Resume';
    document.getElementById('lsPauseBtn').classList.add('paused');
    document.getElementById('lsRunning').classList.add('ls-timer-paused');
    document.getElementById('lsElapsedBar').classList.add('paused');
  } else {
    LS.interval = setInterval(function(){ lsUpdateDisplay(); lsSaveSS(); }, 1000);
  }
  lsUpdateDisplay();
});

window.addEventListener('beforeunload', function(e){
  if (LS.running) { lsSaveSS(); e.preventDefault(); e.returnValue=''; }
});

// ── Quick duration picker ──────────────────────────────────────────
function slSetDur(h, m, btn) {
  document.getElementById('ses_hours').value   = h;
  document.getElementById('ses_minutes').value = m;
  document.querySelectorAll('.sl-dpick').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ── Save session ──────────────────────────────────────────────────
// ── Apply server-rendered fragments in place (no page reload) ─────
function slApplyFragments(data) {
  if (data.statsHtml    !== undefined) document.getElementById('slStatsWrap').innerHTML    = data.statsHtml;
  if (data.srHtml       !== undefined) document.getElementById('slSrWrap').innerHTML       = data.srHtml;
  if (data.sessionsHtml !== undefined) document.getElementById('slSessionsWrap').innerHTML = data.sessionsHtml;
}

function slOpenAddModal() {
  // Clear any leftover success/error message from the last time the modal was used
  var msgEl = document.getElementById('slMsg');
  msgEl.style.display = 'none';
  msgEl.textContent = '';
  msgEl.className = 'sl-alert';

  // Reset the form fields back to their defaults, in case the modal was
  // closed (via ✕ or backdrop click) without saving after being edited
  document.getElementById('ses_subject').value = '';
  document.getElementById('ses_hours').value   = '0';
  document.getElementById('ses_minutes').value = '30';
  document.getElementById('ses_date').value    = new Date().toISOString().slice(0,10);
  document.getElementById('ses_notes').value   = '';
  document.querySelectorAll('.sl-dpick').forEach(b => b.classList.remove('active'));

  var btn = document.getElementById('sesSaveBtn');
  btn.disabled = false; btn.innerHTML = 'Save Session';

  document.getElementById('slAddModal').classList.add('active');
}

async function slSave() {
  var subId = document.getElementById('ses_subject').value;
  var hours = parseInt(document.getElementById('ses_hours').value)   || 0;
  var mins  = parseInt(document.getElementById('ses_minutes').value) || 0;

  if (!subId)          { slAlert('Please select a subject.', 'error'); return; }
  if (hours+mins <= 0) { slAlert('Please enter a duration.', 'error'); return; }

  var btn = document.getElementById('sesSaveBtn');
  btn.disabled = true; btn.innerHTML = '⏳ Saving...';

  try {
    var fd = new FormData();
    fd.append('action','add'); fd.append('subject_id',subId);
    fd.append('date',   document.getElementById('ses_date').value);
    fd.append('hours',  hours); fd.append('minutes', mins);
    fd.append('notes',  document.getElementById('ses_notes').value);

    var res  = await stFetch(location.href, {method:'POST', body:fd, headers:{'X-Requested-With':'XMLHttpRequest'}});
    var data = await res.json();

    if (data.success) {
      slAlert(data.message, 'success');
      slApplyFragments(data);
      document.getElementById('ses_subject').value = '';
      document.getElementById('ses_hours').value   = '0';
      document.getElementById('ses_minutes').value = '30';
      document.getElementById('ses_date').value    = new Date().toISOString().slice(0,10);
      document.getElementById('ses_notes').value   = '';
      document.querySelectorAll('.sl-dpick').forEach(b => b.classList.remove('active'));
      setTimeout(() => {
        document.getElementById('slAddModal').classList.remove('active');
        btn.disabled = false; btn.innerHTML = 'Save Session';
      }, 900);
    } else if (data.locked) {
      btn.disabled = false; btn.innerHTML = 'Save Session';
      document.getElementById('slAddModal').classList.remove('active');
      slToast({
        icon: '🔒', title: 'Account Locked by System',
        msg: data.message,
        buttons: [ { label: 'OK', cls: 'danger', cb: function(){ stReload(); } } ]
      });
    } else if (data.warn) {
      btn.disabled = false; btn.innerHTML = 'Save Session';
      slToast({
        icon: '⚠️', title: 'Unrealistic Session',
        msg: data.message,
        buttons: [ { label: 'I Understand', cls: 'primary', cb: null } ]
      });
    } else {
      slAlert(data.message, 'error');
      btn.disabled = false; btn.innerHTML = 'Save Session';
    }
  } catch(e) {
    slAlert('Connection error. Please try again.', 'error');
    btn.disabled = false; btn.innerHTML = 'Save Session';
  }
}

function slAlert(msg, type) {
  var el = document.getElementById('slMsg');
  el.className = 'sl-alert ' + type;
  el.textContent = (type==='success' ? '✅ ' : '⚠️ ') + msg;
  el.style.display = 'block';
}

// ── Spaced repetition actions ──────────────────────────────────────
async function slReviewDone(id) {
  var fd = new FormData(); fd.append('action','sr_review_done'); fd.append('id', id);
  try {
    var res  = await stFetch(location.href, {method:'POST', body:fd, headers:{'X-Requested-With':'XMLHttpRequest'}});
    var data = await res.json();
    if (data.success) {
      slSnack('✅ ' + data.message);
      slApplyFragments(data);
    } else {
      slSnack('⚠️ ' + (data.message || 'Something went wrong.'));
    }
  } catch(e) { slSnack('⚠️ Network error.'); }
}

async function slReviewMastered(id) {
  var fd = new FormData(); fd.append('action','sr_mastered'); fd.append('id', id);
  try {
    var res  = await stFetch(location.href, {method:'POST', body:fd, headers:{'X-Requested-With':'XMLHttpRequest'}});
    var data = await res.json();
    if (data.success) {
      slSnack('🎓 ' + data.message);
      slApplyFragments(data);
    } else {
      slSnack('⚠️ ' + (data.message || 'Something went wrong.'));
    }
  } catch(e) { slSnack('⚠️ Network error.'); }
}

async function slDelete(id) {
  slToast({
    icon:'🗑️', title:'Delete session?',
    msg:'This study session will be permanently removed.',
    buttons:[
      { label:'Cancel',  cls:'secondary', cb: null },
      { label:'Delete',  cls:'danger', cb: async function(){
        var fd=new FormData(); fd.append('action','delete'); fd.append('id',id);
        var res  = await stFetch(location.href,{method:'POST',body:fd,headers:{'X-Requested-With':'XMLHttpRequest'}});
        var data = await res.json();
        if(data.success){ slSnack('🗑️ Session deleted'); slApplyFragments(data); }
      }},
    ]
  });
}

// Close on backdrop
['slAddModal'].forEach(id => {
  document.getElementById(id).addEventListener('click', function(e){
    if (e.target !== this) return;
    this.classList.remove('active');
  });
});

`;
if(PHP.T(abuseLocked)){
o+=`
slToast({
  icon: '🔒', title: 'Account Locked by System',
  msg: 'Your account has been locked until `;
o+=PHP.s(PHP.date('M j, g:i A', PHP.strtotime(abuseLockedUntil)));
o+=` due to repeated unrealistic session entries. Logging is disabled until then. Contact an admin if you think this is a mistake.',
  buttons: [ { label: 'OK', cls: 'danger', cb: null } ]
});

// ── Poll every 20s to see if an admin has lifted the lock ──
var slLockPoll = setInterval(async function () {
  try {
    var fd = new FormData();
    fd.append('action', 'check_lock');
    var res  = await stFetch(location.href, { method: 'POST', body: fd, headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    var data = await res.json();

    if (data.success && !data.locked) {
      clearInterval(slLockPoll);

      // Remove the lock banner
      var banner = document.getElementById('slLockBanner');
      if (banner) banner.remove();

      // Re-enable the Log Session button
      var addBtn = document.getElementById('slLogSessionBtn');
      if (addBtn) {
        addBtn.disabled = false;
        addBtn.removeAttribute('title');
      }

      // Re-enable the Pomodoro link
      var pomoLink = document.getElementById('slPomodoroLink');
      if (pomoLink) {
        pomoLink.style.pointerEvents = '';
        pomoLink.style.opacity = '';
        pomoLink.removeAttribute('title');
      }

      slToast({
        icon: '🔓', title: 'Account Unlocked',
        msg: 'An admin has lifted the system lock on your account — you can log study sessions again.',
        buttons: [ { label: 'OK', cls: 'primary', cb: null } ]
      });
    }
  } catch (e) {
    // Silent — just retry on the next 20s tick
  }
}, 3000);
`;
}
o+=`
</script>
`;
return o;}}
function tplSLStats(ctx){with(ctx){var o="";
var totalMins = PHP.array_sum(PHP.array_column(sessions,'duration_minutes'));
var days      = PHP.count(PHP.array_unique(PHP.array_column(sessions,'date')));
var avgMins   = days > 0 ? PHP.round(totalMins/days) : 0;
o+=`
  <div class="sl-st sl-st1">
    <div class="sl-sth">
      <div class="sl-sti" style="background:rgba(99,102,241,.12)">⏱️</div>
      <span style="font-size:11px;font-weight:700;padding:3px 9px;border-radius:99px;background:rgba(6,182,212,.12);color:#06b6d4">
        `;
o+=PHP.s(period==='week'?'7 days':(period==='month'?'30 days':(period==='year'?'1 year':'All')));
o+=`
      </span>
    </div>
    <div class="sl-stv">`;
o+=PHP.s(Math.floor(totalMins/60));
o+=`<span class="du">h `;
o+=PHP.s(totalMins%60);
o+=`m</span></div>
    <div class="sl-stl">Total Study Time</div>
  </div>
  <div class="sl-st sl-st2">
    <div class="sl-sth">
      <div class="sl-sti" style="background:rgba(6,182,212,.12)">📋</div>
      <span style="font-size:11px;font-weight:700;padding:3px 9px;border-radius:99px;background:rgba(16,185,129,.12);color:#10b981">Sessions</span>
    </div>
    <div class="sl-stv">`;
o+=PHP.s(PHP.count(sessions));
o+=`</div>
    <div class="sl-stl">Sessions Logged</div>
  </div>
  <div class="sl-st sl-st3">
    <div class="sl-sth">
      <div class="sl-sti" style="background:rgba(16,185,129,.12)">📊</div>
      <span style="font-size:11px;font-weight:700;padding:3px 9px;border-radius:99px;background:rgba(245,158,11,.12);color:#f59e0b">Daily avg</span>
    </div>
    <div class="sl-stv">`;
o+=PHP.s(Math.floor(avgMins/60));
o+=`<span class="du">h `;
o+=PHP.s(avgMins%60);
o+=`m</span></div>
    <div class="sl-stl">Avg Per Study Day</div>
  </div>
  <div class="sl-st sl-st4">
    <div class="sl-sth">
      <div class="sl-sti" style="background:rgba(245,158,11,.12)">🏆</div>
      <span style="font-size:11px;font-weight:700;padding:3px 9px;border-radius:99px;background:rgba(99,102,241,.12);color:#818cf8">1h = 1pt</span>
    </div>
    <div class="sl-stv">`;
o+=PHP.s(PHP.number_format(studyPoints));
o+=`</div>
    <div class="sl-stl">`;
o+=PHP.s(minsToNextPoint > 0 ? minsToNextPoint+'m to next point' : 'Study Points');
o+=`</div>
  </div>
    `;

return o;}}
function tplSLSr(ctx){with(ctx){var o="";

o+=`
  <div class="sl-card-hd">
    <div class="sl-card-t">🔁 Spaced Repetition</div>
    `;
if(PHP.count(dueReviews) > 0){
o+=`
      <span class="sl-card-meta" style="background:rgba(239,68,68,.12);color:#ef4444;padding:4px 11px;border-radius:99px;font-weight:700">`;
o+=PHP.s(PHP.count(dueReviews));
o+=` due now</span>
    `;
}else{
o+=`
      <span class="sl-card-meta">Every topic you log gets its own review schedule</span>
    `;
}
o+=`
  </div>

  `;
if(PHP.T(dueReviews)){
o+=`
    <div id="slSrDueList">
    `;
for(var a14=PHP.arr(dueReviews),i_a14=0,r;i_a14<a14.length&&((r=a14[i_a14]),true);i_a14++){
var daysAgo = Math.max(0, ~~((PHP.strtotime('today') - PHP.strtotime(r['last_studied_date'])) / 86400));
o+=`
    <div class="sl-sr-row" id="slSrRow`;
o+=PHP.s(r['id']);
o+=`" style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:14px;padding:13px 16px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <div style="min-width:0;flex:1 1 220px">
        <div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
          <span class="sl-dot" style="background:`;
o+=PHP.s(E(r['subject_color']));
o+=`"></span>
          `;
o+=PHP.s(E(r['topic']));
o+=`
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:3px">
          `;
o+=PHP.s(E(r['subject_name']));
o+=` &bull; last studied `;
o+=PHP.s(daysAgo === 0 ? 'today' : daysAgo+'d ago');
o+=` &bull; review #`;
o+=PHP.s(~~r['times_reviewed']);
o+=`
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-shrink:0">
        <button onclick="slReviewDone(`;
o+=PHP.s(r['id']);
o+=`)" style="padding:8px 14px;border-radius:10px;border:none;background:rgba(99,102,241,.14);color:#818cf8;font-family:var(--sl-db);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap">✅ Reviewed</button>
        <button onclick="slReviewMastered(`;
o+=PHP.s(r['id']);
o+=`)" style="padding:8px 14px;border-radius:10px;border:none;background:rgba(16,185,129,.14);color:#10b981;font-family:var(--sl-db);font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap">🎓 Mastered</button>
      </div>
    </div>
    `;
}
o+=`
    </div>
  `;
}else{
o+=`
    <div class="sl-empty" style="padding:24px 20px">
      <div class="sl-ei">🎉</div>
      <h3>Nothing due for review</h3>
      <p>Add a note on what you studied when logging a session — we'll automatically remind you when it's time to revisit it.</p>
    </div>
  `;
}
return o;}}
function tplSLSessions(ctx){with(ctx){var o="";
var totalMins = PHP.array_sum(PHP.array_column(sessions,'duration_minutes'));
o+=`
  <div class="sl-card-hd">
    <div class="sl-card-t">📋 Study Sessions</div>
    <span class="sl-card-meta">`;
o+=PHP.s(PHP.count(sessions));
o+=` sessions &bull; `;
o+=PHP.s(Math.floor(totalMins/60));
o+=`h `;
o+=PHP.s(totalMins%60);
o+=`m</span>
  </div>

  `;
if(PHP.T(sessions)){
o+=`
  <div class="sl-row-hd">
    <span>Date</span><span>Subject</span><span>Duration</span><span>Notes</span><span></span>
  </div>
  `;
for(var a15=PHP.arr(sessions),i_a15=0,s;i_a15<a15.length&&((s=a15[i_a15]),true);i_a15++){
o+=`
  <div class="sl-row">
    <div class="sl-date">
      <strong>`;
o+=PHP.s(PHP.date('M j, Y', PHP.strtotime(s['date'])));
o+=`</strong>
      `;
o+=PHP.s(PHP.date('D', PHP.strtotime(s['date'])));
o+=`
    </div>
    <div class="sl-subj">
      <span class="sl-dot" style="background:`;
o+=PHP.s(E(s['color']));
o+=`"></span>
      `;
o+=PHP.s(E(s['subject_name']));
o+=`
    </div>
    <div class="sl-dur">`;
o+=PHP.s(Math.floor(s['duration_minutes']/60));
o+=`h `;
o+=PHP.s(s['duration_minutes']%60);
o+=`m</div>
    <div class="sl-notes">
      <span class="sl-notes-txt">`;
o+=PHP.s(s['notes'] ? E(s['notes']) : '<span style="color:var(--text-muted)">—</span>');
o+=`</span>
    </div>
    <div class="sl-del"><button onclick="slDelete(`;
o+=PHP.s(s['id']);
o+=`)" title="Delete">🗑</button></div>
  </div>
  `;
}
o+=`
  `;
}else{
o+=`
  <div class="sl-empty">
    <div class="sl-ei">⏱️</div>
    <h3>No sessions in this period</h3>
    <p>Click "＋ Log Session" to start tracking</p>
  </div>
  `;
}
return o;}}
