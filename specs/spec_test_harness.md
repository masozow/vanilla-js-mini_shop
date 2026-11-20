# SPEC — Browser Test Harness and Trustworthy Runs

Status: Implemented (core)
Depends on: none
Gates: none
Findings: T-01, T-02
Last updated: 2026-11-20

## Context and goal

The project has no Node.js, no Python, no package manager, and no bundler. Tests are native ES modules loaded in the browser. The current suite uses a hand-rolled `miniTest` helper that catches every error, prints `[0]`, and continues, so the console can look green while tests failed. The `CartService` suite also shared one service instance across tests, which made results order-dependent.

There is no `test.html`. The suite is a barrel at `src/shared/test/index.js`, loaded by uncommenting the last line of `src/main.js`:

```js
// await import('./shared/test/index.js');
```

The harness must stay simple enough for an interview demo while behaving like a senior test runner: clear reporting, isolation, useful matchers, JSDoc, and no dependencies.

Goal: a deterministic browser harness that records failures, prints a clear summary, isolates every test, and fails loudly through `report()`.

## Users / actors

- Developer demonstrating the project in an interview.
- AI agent implementing a spec and reading the console result.
- Maintainer reviewing a regression.

## User stories

- H1: As a developer, I want a failing test to turn the run red so I cannot show a false green result.
- H2: As a developer, I want each test to start from a clean state so failures are reproducible in isolation.
- H3: As an agent, I want a stable summary I can inspect without guessing from console colors.
- H4: As a maintainer, I want the suite to remain one commented import away, with no test page and no tooling.

## Runtime and entry points

| Aspect | Decision |
|---|---|
| Runtime | Browser only; native ES modules. |
| Entry point | Uncomment `await import('./shared/test/index.js')` at the bottom of `src/main.js`. |
| Fallback | DevTools console: `await import('/src/shared/test/index.js')` on the served page. |
| Test barrel | `src/shared/test/index.js` imports every test file, then calls `report()`. |
| Meta-test | `src/shared/test/harness.test.js`, permanent and isolated, with its import commented in the barrel. |
| Server | VS Code Live Server (port `5500`) or any static host. |
| Dependencies | None. No Node.js, no Python, no npm, no bundler. |
| Result channel | Console group per `describe`, per-test `[1]`/`[0]`, final `[PASS]`/`[FAIL]` summary. |

## Functional requirements (EARS)

- RF-TH-1: WHEN a test throws or rejects, THE SYSTEM SHALL record the failure, mark the run as failed, and SHALL NOT stop the remaining tests.
- RF-TH-2: WHEN the suite ends with one or more failures, THE SYSTEM SHALL print a `[FAIL]` summary with the passed/failed counts and the failed test names, and SHALL log it with `console.error`.
- RF-TH-3: WHEN the suite ends with zero failures, THE SYSTEM SHALL print a `[PASS]` summary with the passed count and SHALL log it with `console.info`.
- RF-TH-4: WHEN `report()` runs with failures, THE SYSTEM SHALL throw one `AggregateError` after the summary so the browser console cannot mistake the run for success.
- RF-TH-5: THE SYSTEM SHALL provide `toEqual`, `toContain`, `toInclude`, `toThrow`, `toThrowAsync`, and `not` matchers alongside `toBe`.
- RF-TH-6: THE SYSTEM SHALL support both synchronous and asynchronous test callbacks.
- RF-TH-7: THE SYSTEM SHALL provide `beforeEach` and `afterEach` hooks scoped to the current `describe`, so no mutable state is shared between tests or groups.
- RF-TH-8: THE SYSTEM SHALL provide `runIsolated()` so a deliberately failing callback can prove failure detection without affecting the real suite.
- RF-TH-9: THE SYSTEM SHALL provide `deferred()`, `spy()`, `fakeStorage()`, and `fakeFetch()` helpers, and `silenced()` SHALL return the function result.
- RF-TH-10: WHEN the developer uncomments the import at the bottom of `src/main.js`, THE SYSTEM SHALL run the suite without a test page, build step, or terminal runner.
- RF-TH-11: THE SYSTEM SHALL run without network access and without adding runtime dependencies.
- RF-TH-12: WHEN a test logs to `console.error`, THE SYSTEM SHALL allow silencing that output without hiding assertion failures.
- RF-TH-13: THE SYSTEM SHALL keep test descriptions and JSDoc in English.
- RF-TH-14: WHEN the existing tests run, THE SYSTEM SHALL run each of them independently and in any order.
- RF-TH-15: WHEN a test file is imported twice by mistake, THE SYSTEM SHALL rely on ES module caching and run its tests once.
- RF-TH-16: WHEN the page reloads or `reset()` is called, THE SYSTEM SHALL start from clean results and clean hooks.
- RF-TH-17: THE SYSTEM SHALL document every exported harness function with JSDoc: purpose, parameters, and return value.
- RF-TH-18: THE SYSTEM SHALL keep the meta-test import commented in `src/shared/test/index.js` so it stays permanent but does not turn the normal suite red.
- RF-TH-19: WHEN `report()` runs, THE SYSTEM SHALL print the pass/fail counts and every failed test name.

## Non-functional requirements

- Total suite runtime under 2 seconds on the current machine.
- Browser only: current Chrome or Firefox; no Node.js, Python, package manager, or bundler.
- No global state leaks between test files.
- Output readable in the browser console.
- The harness has no DOM dependency and no dependency beyond the browser runtime.

## Edge cases

- An async test that rejects after the summary has started.
- A test that throws a non-`Error` value.
- A helper fake reused accidentally across tests.
- Console noise from expected error paths.
- A test file imported twice by mistake.
- `localStorage` unavailable (private mode or blocked cookies).
- A test page opened from `file://` where module imports may be blocked; a static host is required.
- The user clears the console before reading the summary.
- The page is navigated away mid-run.

## Out of scope

- A separate `test.html` or test page.
- Replacing the harness with Vitest, Jest, or Playwright.
- A Node.js or Python runner.
- DOM integration tests; those are covered by `spec_integration_tests`.
- A full CI pipeline.

## Completion criteria

- `src/shared/test/miniTest.js` implements the API and JSDoc described here.
- `src/shared/test/index.js` imports the suite and calls `report()`.
- The commented meta-test import exists in the barrel.
- Uncommenting the `src/main.js` import runs the suite and prints the summary.
- The meta-test proves a deliberate failure is recorded in isolation.
- `CartService` tests pass in isolation and in any order.
- A deliberately broken test produces `[0]`, a `[FAIL]` summary, and an `AggregateError`.
- The run reports success only when every test passes.
- The workflow uses no Node.js, Python, package manager, or build step.

## Traceability

| Finding | Requirement |
|---|---|
| T-01 | RF-TH-1 … RF-TH-4, RF-TH-8, RF-TH-19 |
| T-02 | RF-TH-7, RF-TH-14 |
| Constitution P1 | RF-TH-10, RF-TH-11 |
| Constitution P4 | RF-TH-8, RF-TH-14 |
| Constitution P8–P9 | RF-TH-13, RF-TH-17 |

## Open questions

None. The harness is hardened in place, the meta-test stays permanent and isolated, and the suite is loaded from the commented import in `src/main.js`.
