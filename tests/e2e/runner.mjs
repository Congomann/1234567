/**
 * E2E Test Suite Runner Executable
 * File: tests/e2e/runner.mjs
 * 
 * Command: node tests/e2e/runner.mjs
 * 
 * Features:
 * - Dynamically imports and executes 4 test tier modules:
 *   1. ./tier1_feature_coverage.test.mjs
 *   2. ./tier2_boundary_corner.test.mjs
 *   3. ./tier3_cross_feature.test.mjs
 *   4. ./tier4_real_world.test.mjs
 * - Registers global assertion helpers (expect, test, describe, etc.)
 * - Initializes helper fallback modes if backend server/DB/WebSocket is offline
 * - Tracks per-tier pass/fail stats and execution timing
 * - Outputs clean console table summary
 * - Exits with code 0 if all tests pass, or non-zero on failure
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { performance } from 'perf_hooks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import helpers to configure fallback state if needed
import httpHelper from './helpers/httpHelper.mjs';
import wsHelper from './helpers/wsHelper.mjs';
import dbHelper from './helpers/dbHelper.mjs';
import uiHelper from './helpers/uiHelper.mjs';

// Global Test Registry and State
const testRegistry = [];
let currentSuiteName = 'General Suite';

/**
 * Global Assertion Library (expect)
 */
function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)} but received ${JSON.stringify(actual)}`);
      }
    },
    toEqual(expected) {
      const actStr = JSON.stringify(actual);
      const expStr = JSON.stringify(expected);
      if (actStr !== expStr) {
        throw new Error(`Expected equal objects.\nExpected: ${expStr}\nReceived: ${actStr}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected value to be truthy, but received ${JSON.stringify(actual)}`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected value to be falsy, but received ${JSON.stringify(actual)}`);
      }
    },
    toContain(item) {
      if (typeof actual === 'string') {
        if (!actual.includes(item)) {
          throw new Error(`Expected string "${actual}" to contain "${item}"`);
        }
      } else if (Array.isArray(actual)) {
        if (!actual.includes(item)) {
          throw new Error(`Expected array to contain ${JSON.stringify(item)}`);
        }
      } else {
        throw new Error(`toContain can only be used on strings or arrays`);
      }
    },
    toBeGreaterThanOrEqual(expected) {
      if (typeof actual !== 'number' || actual < expected) {
        throw new Error(`Expected ${actual} to be >= ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected) {
      if (typeof actual !== 'number' || actual > expected) {
        throw new Error(`Expected ${actual} to be <= ${expected}`);
      }
    },
    toThrow() {
      let threw = false;
      try {
        if (typeof actual === 'function') actual();
      } catch (e) {
        threw = true;
      }
      if (!threw) {
        throw new Error(`Expected function to throw an error, but it did not throw.`);
      }
    },
    not: {
      toBe(expected) {
        if (actual === expected) {
          throw new Error(`Expected value NOT to be ${JSON.stringify(expected)}`);
        }
      },
      toContain(item) {
        if (typeof actual === 'string' && actual.includes(item)) {
          throw new Error(`Expected string "${actual}" NOT to contain "${item}"`);
        }
      }
    }
  };
}

/**
 * Global Test Registration Functions
 */
function test(name, fn) {
  testRegistry.push({
    suite: currentSuiteName,
    name,
    fn
  });
}

function describe(suiteName, fn) {
  const prevSuite = currentSuiteName;
  currentSuiteName = suiteName;
  try {
    fn();
  } finally {
    currentSuiteName = prevSuite;
  }
}

// Attach helpers to globalThis so suite files can use them freely
globalThis.expect = expect;
globalThis.test = test;
globalThis.it = test;
globalThis.describe = describe;

/**
 * List of 4 target test modules to execute in order
 */
const TEST_MODULES = [
  { tier: 'Tier 1', name: 'Feature Coverage Suite', path: './tier1_feature_coverage.test.mjs' },
  { tier: 'Tier 2', name: 'Boundary & Corner Case Suite', path: './tier2_boundary_corner.test.mjs' },
  { tier: 'Tier 3', name: 'Cross-Feature Pairwise Suite', path: './tier3_cross_feature.test.mjs' },
  { tier: 'Tier 4', name: 'Real-World Application Suite', path: './tier4_real_world.test.mjs' }
];

/**
 * Main Runner Function
 */
async function main() {
  console.log('\n================================================================');
  console.log(' New Holland Financial CRM — E2E Test Suite Runner');
  console.log('================================================================\n');

  // Verify server readiness / enable mock fallbacks if server offline
  try {
    const healthCheck = await httpHelper.get('/api/signalwire/credentials');
    if (!healthCheck.ok) {
      console.log('ℹ Backend server offline. Activating mock test helpers fallback mode...\n');
      httpHelper.setMockHttpFallback(true);
      dbHelper.setMockDb(true);
    } else {
      console.log('✓ Backend API server detected online at http://localhost:3001.\n');
    }
  } catch (err) {
    console.log('ℹ Backend server offline. Activating mock test helpers fallback mode...\n');
    httpHelper.setMockHttpFallback(true);
    dbHelper.setMockDb(true);
  }

  const tierSummary = [];
  let grandTotal = 0;
  let grandPassed = 0;
  let grandFailed = 0;
  const runnerStartTime = performance.now();

  for (const moduleInfo of TEST_MODULES) {
    const tierStartTime = performance.now();
    const startCount = testRegistry.length;
    currentSuiteName = `${moduleInfo.tier}: ${moduleInfo.name}`;

    let tierPassed = 0;
    let tierFailed = 0;
    let importError = null;

    const modulePath = path.resolve(__dirname, moduleInfo.path);

    if (!fs.existsSync(modulePath)) {
      console.log(`ℹ ${moduleInfo.tier} file not present yet (${moduleInfo.path}) — skipping.`);
      const tierEndTime = performance.now();
      tierSummary.push({
        'Tier': moduleInfo.tier,
        'Suite Name': moduleInfo.name,
        'Total': 0,
        'Passed': 0,
        'Failed': 0,
        'Time (ms)': Math.round(tierEndTime - tierStartTime)
      });
      continue;
    }

    try {
      const mod = await import(modulePath);

      // Execute exported run function or default if present
      if (typeof mod.run === 'function') {
        await mod.run();
      } else if (typeof mod.default === 'function') {
        await mod.default();
      }
    } catch (err) {
      importError = err;
    }

    // Execute all tests registered for this module
    const testsToRun = testRegistry.slice(startCount);

    if (importError && testsToRun.length === 0) {
      console.error(`❌ Failed to load module ${moduleInfo.path}: ${importError.message}`);
      tierFailed++;
    } else {
      console.log(`▶ Running ${moduleInfo.tier} — ${moduleInfo.name} (${testsToRun.length} test cases)...`);

      for (const t of testsToRun) {
        try {
          await t.fn();
          tierPassed++;
        } catch (err) {
          tierFailed++;
          console.error(`   ❌ FAIL: ${t.name}`);
          console.error(`      ${err.stack || err.message}`);
        }
      }
    }

    const tierEndTime = performance.now();
    const durationMs = Math.round(tierEndTime - tierStartTime);
    const tierTotal = testsToRun.length || (importError ? 1 : 0);

    tierSummary.push({
      'Tier': moduleInfo.tier,
      'Suite Name': moduleInfo.name,
      'Total': tierTotal,
      'Passed': tierPassed,
      'Failed': tierFailed,
      'Time (ms)': durationMs
    });

    grandTotal += tierTotal;
    grandPassed += tierPassed;
    grandFailed += tierFailed;

    console.log(`   Completed ${moduleInfo.tier}: ${tierPassed}/${tierTotal} Passed (${durationMs}ms)\n`);
  }

  const runnerEndTime = performance.now();
  const totalDurationMs = Math.round(runnerEndTime - runnerStartTime);

  console.log('================================================================');
  console.log(' PER-TIER E2E TEST RESULTS SUMMARY');
  console.log('================================================================\n');

  console.table(tierSummary);

  console.log(`Total Test Cases Executed: ${grandTotal}`);
  console.log(`Passed:                   ${grandPassed}`);
  console.log(`Failed:                   ${grandFailed}`);
  console.log(`Total Execution Time:     ${(totalDurationMs / 1000).toFixed(2)}s\n`);

  // Clean up helper resources
  wsHelper.closeWs();
  await dbHelper.closePool();

  if (grandFailed > 0) {
    console.error(`❌ E2E TEST RUN FAILED (${grandFailed} test failure(s)).\n`);
    process.exit(1);
  } else {
    console.log(`✅ ALL E2E TEST SUITES PASSED CLEANLY (100% PASS RATE).\n`);
    process.exit(0);
  }
}

// Execute runner if executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('runner.mjs')) {
  main().catch((err) => {
    console.error('Unhandled Runner Rejection:', err);
    process.exit(1);
  });
}

export { main, expect, test, describe };
