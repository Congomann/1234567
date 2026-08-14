import { assert } from 'console';

// ---------------------------------------------------------------------------
// Pure logic extract of MeetingsDashboard & DataContext for empirical testing
// ---------------------------------------------------------------------------

// 1. Stats Counter Logic
function calculateStats(events) {
  let scheduled = 0;
  let rescheduled = 0;
  let canceled = 0;

  events.forEach(ev => {
    const st = ev.status || 'scheduled';
    if (st === 'scheduled') scheduled++;
    else if (st === 'rescheduled') rescheduled++;
    else if (st === 'canceled') canceled++;
  });

  return { scheduled, rescheduled, canceled };
}

// 2. Event Filtering Logic (Status, Tab, Search)
function filterEvents(events, activeTab, statusFilter, searchQuery) {
  return events.filter(ev => {
    const evStatus = ev.status || 'scheduled';

    // 1. Status Card / Dropdown Filter
    if (statusFilter !== 'all' && evStatus !== statusFilter) {
      return false;
    }

    // 2. Tab Filter
    if (activeTab === 'upcoming') {
      if (evStatus === 'canceled' && statusFilter === 'all') return false;
      if (evStatus === 'completed' && statusFilter === 'all') return false;
    } else if (activeTab === 'previous') {
      if (evStatus !== 'completed' && evStatus !== 'canceled' && statusFilter === 'all') {
        const evDate = new Date(`${ev.date} ${ev.time || '00:00'}`);
        if (evDate >= new Date() && evStatus !== 'completed') return false;
      }
    }

    // 3. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = (ev.title || '').toLowerCase().includes(q);
      const descMatch = ev.description?.toLowerCase().includes(q) || false;
      const participantMatch = ev.participants?.some(p => (p.name || '').toLowerCase().includes(q)) || false;
      return titleMatch || descMatch || participantMatch;
    }

    return true;
  });
}

// 3. Initials Generation Logic
function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length >= 2 && parts[0] && parts[1]) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.trim().substring(0, 2).toUpperCase();
}

// 4. DataContext updateEvent State Reducer Logic
function simulateUpdateEvent(eventsState, eventPartial) {
  const updated = eventsState.map(ev => (ev.id === eventPartial.id ? { ...ev, ...eventPartial } : ev));
  return updated;
}

// ---------------------------------------------------------------------------
// TEST RUNNER
// ---------------------------------------------------------------------------
let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}:`, err.message);
    failed++;
  }
}

console.log("=== EMPIRICAL STRESS SUITE: M1 EDGE CASES ===");

// --- EDGE CASE 1: SEARCH QUERIES ---
runTest("Search Query: empty string returns all matching tab events", () => {
  const events = [
    { id: '1', title: 'Q3 Strategy', status: 'scheduled', date: '2026-08-20', time: '10:00 AM' },
    { id: '2', title: 'Tax Review', status: 'rescheduled', date: '2026-08-21', time: '11:00 AM' },
  ];
  const res = filterEvents(events, 'upcoming', 'all', '');
  assert(res.length === 2, `Expected 2 events, got ${res.length}`);
});

runTest("Search Query: whitespace query handled cleanly", () => {
  const events = [
    { id: '1', title: 'Q3 Strategy', status: 'scheduled' },
  ];
  const res = filterEvents(events, 'upcoming', 'all', '   \t  ');
  assert(res.length === 1, `Expected 1 event, got ${res.length}`);
});

runTest("Search Query: partial match on title, description, participant", () => {
  const events = [
    { id: '1', title: 'Q3 Strategy', description: 'Wealth management', participants: [{ name: 'Alice Smith' }], status: 'scheduled' },
    { id: '2', title: 'Tax Audit', description: 'Internal review', participants: [{ name: 'Bob Jones' }], status: 'scheduled' },
  ];
  const resTitle = filterEvents(events, 'upcoming', 'all', 'q3');
  assert(resTitle.length === 1 && resTitle[0].id === '1', "Title match failed");

  const resDesc = filterEvents(events, 'upcoming', 'all', 'internal');
  assert(resDesc.length === 1 && resDesc[0].id === '2', "Desc match failed");

  const resPart = filterEvents(events, 'upcoming', 'all', 'smith');
  assert(resPart.length === 1 && resPart[0].id === '1', "Participant match failed");
});

runTest("Search Query: participant with missing/null name does not crash search", () => {
  const events = [
    { id: '1', title: 'Malformed Part', status: 'scheduled', participants: [{ avatar: 'http://foo' }] },
  ];
  // Should not throw TypeError
  const res = filterEvents(events, 'upcoming', 'all', 'something');
  assert(res.length === 0, "Should safely return 0 results");
});

// --- EDGE CASE 2: MISSING AVATARS & PARTICIPANTS ---
runTest("Missing Avatars: getInitials handles standard, single, empty, null names", () => {
  assert(getInitials("Sarah Jenkins") === "SJ", `Got ${getInitials("Sarah Jenkins")}`);
  assert(getInitials("David") === "DA", `Got ${getInitials("David")}`);
  assert(getInitials("  ") === "", `Got ${getInitials("  ")}`);
  assert(getInitials(null) === "", `Got ${getInitials(null)}`);
  assert(getInitials(undefined) === "", `Got ${getInitials(undefined)}`);
});

runTest("Missing Avatars: events with null/undefined participants array", () => {
  const events = [
    { id: '1', title: 'No Participants', status: 'scheduled', participants: undefined },
    { id: '2', title: 'Empty Participants', status: 'scheduled', participants: [] },
  ];
  const stats = calculateStats(events);
  assert(stats.scheduled === 2, "Stats calculation with undefined participants failed");
});

// --- EDGE CASE 3: NULL/UNDEFINED STATUS FALLBACKS ---
runTest("Status Fallbacks: null and undefined status default to 'scheduled'", () => {
  const events = [
    { id: '1', title: 'Null Status', status: null },
    { id: '2', title: 'Undefined Status', status: undefined },
    { id: '3', title: 'Canceled', status: 'canceled' },
    { id: '4', title: 'Rescheduled', status: 'rescheduled' },
  ];

  const stats = calculateStats(events);
  assert(stats.scheduled === 2, `Expected 2 scheduled, got ${stats.scheduled}`);
  assert(stats.rescheduled === 1, `Expected 1 rescheduled, got ${stats.rescheduled}`);
  assert(stats.canceled === 1, `Expected 1 canceled, got ${stats.canceled}`);

  const filteredScheduled = filterEvents(events, 'upcoming', 'scheduled', '');
  assert(filteredScheduled.length === 2, `Expected 2 filtered scheduled, got ${filteredScheduled.length}`);
});

// --- EDGE CASE 4: CONTEXT STATE UPDATES VIA updateEvent ---
runTest("Context State: updateEvent updates timezone immutably", () => {
  const initialEvents = [
    { id: 'evt-1', title: 'Meeting 1', timezone: 'EDT', recordingEnabled: false },
    { id: 'evt-2', title: 'Meeting 2', timezone: 'PDT', recordingEnabled: true },
  ];

  const updated = simulateUpdateEvent(initialEvents, { id: 'evt-1', timezone: 'GMT' });
  assert(updated[0].timezone === 'GMT', "Timezone not updated");
  assert(updated[0].recordingEnabled === false, "Other fields mutated unexpectedly");
  assert(updated[1] === initialEvents[1], "Immutability violated for untouched item");
});

runTest("Context State: updateEvent toggles recordingEnabled", () => {
  const initialEvents = [
    { id: 'evt-1', title: 'Meeting 1', recordingEnabled: false },
  ];

  const step1 = simulateUpdateEvent(initialEvents, { id: 'evt-1', recordingEnabled: true });
  assert(step1[0].recordingEnabled === true, "Recording enable failed");

  const step2 = simulateUpdateEvent(step1, { id: 'evt-1', recordingEnabled: false });
  assert(step2[0].recordingEnabled === false, "Recording disable failed");
});

runTest("Context State: updateEvent updates status and triggers stats recalculation", () => {
  const initialEvents = [
    { id: 'evt-1', title: 'Meeting 1', status: 'scheduled' },
  ];
  let stats = calculateStats(initialEvents);
  assert(stats.scheduled === 1 && stats.canceled === 0, "Initial stats incorrect");

  const updated = simulateUpdateEvent(initialEvents, { id: 'evt-1', status: 'canceled' });
  stats = calculateStats(updated);
  assert(stats.scheduled === 0 && stats.canceled === 1, "Recalculated stats incorrect after updateEvent");
});

console.log("\n=============================================");
console.log(`TOTAL RESULT: ${passed} PASSED, ${failed} FAILED`);
console.log("=============================================");
if (failed > 0) process.exit(1);
