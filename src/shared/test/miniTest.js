/**
 * Minimal browser-first test harness for this project.
 *
 * Why this exists: the project has no Node.js, Python, package manager, or
 * bundler. Tests run as native ES modules in a browser tab. The harness must
 * therefore report failures clearly, isolate tests, and stay dependency-free.
 *
 * The public API is intentionally small:
 * - describe / it / beforeEach / afterEach for structure and isolation.
 * - expect for assertions.
 * - report to print the final summary and fail the run.
 * - runIsolated to prove the harness catches a deliberate failure.
 * - spy / deferred / fakeStorage / fakeFetch / silenced for test doubles.
 */

/**
 * Creates the mutable result store for one suite run.
 *
 * @returns {{ passed: number, failed: number, failures: Array<{ test: string, error: unknown }> }}
 */
const createResults = () => ({
    passed: 0,
    failed: 0,
    failures: []
});

let results = createResults();
let hooks = { beforeEach: null, afterEach: null };

/**
 * Converts any thrown value into a readable message.
 *
 * @param {unknown} error Value thrown or rejected by a test.
 * @returns {string} Human-readable error text.
 */
const formatError = (error) => {
    if (error instanceof Error) return `${error.name}: ${error.message}`;
    return String(error);
};

/**
 * Converts a value into a short readable representation for assertion messages.
 *
 * @param {unknown} value Value to print.
 * @returns {string} Readable value.
 */
const formatValue = (value) => {
    if (typeof value === 'string') return `"${value}"`;
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
};

/**
 * Deeply compares two values. Arrays and plain objects are compared by their
 * own enumerable keys; primitives use `Object.is`, so `NaN` equals `NaN`.
 *
 * @param {unknown} actual Value produced by the code under test.
 * @param {unknown} expected Value declared by the test.
 * @returns {boolean} True when both values are structurally equal.
 */
const deepEqual = (actual, expected) => {
    if (Object.is(actual, expected)) return true;
    if (typeof actual !== 'object' || actual === null) return false;
    if (typeof expected !== 'object' || expected === null) return false;
    if (Array.isArray(actual) !== Array.isArray(expected)) return false;
    const actualKeys = Object.keys(actual);
    const expectedKeys = Object.keys(expected);
    if (actualKeys.length !== expectedKeys.length) return false;
    return actualKeys.every(
        (key) => Object.prototype.hasOwnProperty.call(expected, key) && deepEqual(actual[key], expected[key])
    );
};

/**
 * Throws when a condition is false.
 *
 * @param {boolean} condition Condition that must hold.
 * @param {string} message Assertion message shown on failure.
 * @returns {void}
 */
const assert = (condition, message) => {
    if (!condition) throw new Error(message);
};

/**
 * Checks whether a thrown value matches the expected shape.
 *
 * @param {unknown} error Value thrown by the code under test.
 * @param {string | RegExp | Function | undefined} expected Expected message fragment, pattern, or error class.
 * @returns {boolean} True when the error matches.
 */
const matchesError = (error, expected) => {
    if (expected === undefined) return true;
    const text = formatError(error);
    if (expected instanceof RegExp) return expected.test(text);
    if (typeof expected === 'function') return error instanceof expected;
    if (typeof expected === 'string') return text.includes(expected);
    return false;
};

/**
 * Records a passing test and prints its result.
 *
 * @param {string} description Test description.
 * @returns {void}
 */
const recordPass = (description) => {
    results.passed += 1;
    console.log(`[1] ${description}`);
};

/**
 * Records a failing test and prints its result without stopping the suite.
 *
 * @param {string} description Test or group description.
 * @param {unknown} error Thrown or rejected value.
 * @returns {void}
 */
const recordFailure = (description, error) => {
    results.failed += 1;
    results.failures.push({ test: description, error });
    console.error(`[0] ${description} error - ${formatError(error)}`);
};

/**
 * Registers a function that runs before every test in the current `describe`.
 *
 * @param {() => void | Promise<void>} hook Setup function.
 * @returns {void}
 */
export const beforeEach = (hook) => {
    hooks.beforeEach = hook;
};

/**
 * Registers a function that runs after every test in the current `describe`.
 *
 * @param {() => void | Promise<void>} hook Cleanup function.
 * @returns {void}
 */
export const afterEach = (hook) => {
    hooks.afterEach = hook;
};

/**
 * Runs a named group of tests. Hooks registered inside the group apply only to
 * that group and are restored when it ends.
 *
 * @param {string} description Group description.
 * @param {() => void | Promise<void>} testGroup Function that registers and awaits the tests.
 * @returns {Promise<void>} Resolves when the group finishes.
 */
export const describe = async (description, testGroup) => {
    const previousHooks = hooks;
    hooks = { ...previousHooks };
    console.group(description);
    try {
        await testGroup();
    } catch (error) {
        recordFailure(description, error);
    } finally {
        console.groupEnd();
        hooks = previousHooks;
    }
};

/**
 * Runs one test, applying the current hooks and recording pass or failure.
 * A failing test never stops the rest of the suite.
 *
 * @param {string} description Test description.
 * @param {() => void | Promise<void>} test Test body.
 * @returns {Promise<void>} Resolves after the result is recorded.
 */
export const it = async (description, test) => {
    const testHooks = hooks;
    try {
        if (testHooks.beforeEach) await testHooks.beforeEach();
        await test();
        recordPass(description);
    } catch (error) {
        recordFailure(description, error);
    } finally {
        if (testHooks.afterEach) {
            try {
                await testHooks.afterEach();
            } catch (error) {
                recordFailure(`${description} (afterEach)`, error);
            }
        }
    }
};

/**
 * Creates a set of assertions for one actual value.
 *
 * @param {unknown} actual Value produced by the code under test.
 * @returns {object} Matcher object with positive, negative, and throw assertions.
 */
export const expect = (actual) => {
    /**
     * Asserts strict equality.
     *
     * @param {unknown} expected Expected value.
     * @returns {void}
     */
    const toBe = (expected) => {
        assert(Object.is(actual, expected), `Expected ${formatValue(actual)} to be ${formatValue(expected)}.`);
    };

    /**
     * Asserts structural equality for arrays and plain objects.
     *
     * @param {unknown} expected Expected value.
     * @returns {void}
     */
    const toEqual = (expected) => {
        assert(deepEqual(actual, expected), `Expected ${formatValue(actual)} to equal ${formatValue(expected)}.`);
    };

    /**
     * Asserts that a string contains a fragment or an array contains a value.
     *
     * @param {unknown} expected Fragment or value to find.
     * @returns {void}
     */
    const toContain = (expected) => {
        const contains = typeof actual === 'string'
            ? actual.includes(expected)
            : Array.isArray(actual)
                ? actual.some((item) => deepEqual(item, expected))
                : false;
        assert(contains, `Expected ${formatValue(actual)} to contain ${formatValue(expected)}.`);
    };

    /**
     * Asserts that a function throws. Accepts an optional message fragment,
     * regular expression, or error class.
     *
     * @param {string | RegExp | Function} [expected] Expected error shape.
     * @returns {void}
     */
    const toThrow = (expected) => {
        assert(typeof actual === 'function', 'toThrow expects a function.');
        let thrown;
        try {
            actual();
        } catch (error) {
            thrown = error;
        }
        assert(thrown !== undefined, 'Expected the function to throw, but it returned normally.');
        assert(matchesError(thrown, expected), `Expected a thrown error matching ${formatValue(expected)}, received ${formatError(thrown)}.`);
    };

    /**
     * Asserts that a function or promise rejects. Accepts an optional message
     * fragment, regular expression, or error class.
     *
     * @param {string | RegExp | Function} [expected] Expected error shape.
     * @returns {Promise<void>} Resolves when the assertion finishes.
     */
    const toThrowAsync = async (expected) => {
        assert(
            typeof actual === 'function' || actual instanceof Promise,
            'toThrowAsync expects a function or a promise.'
        );
        let thrown;
        try {
            await (typeof actual === 'function' ? actual() : actual);
        } catch (error) {
            thrown = error;
        }
        assert(thrown !== undefined, 'Expected the function or promise to reject, but it resolved.');
        assert(matchesError(thrown, expected), `Expected a rejection matching ${formatValue(expected)}, received ${formatError(thrown)}.`);
    };

    const not = {
        /** Asserts strict inequality. @param {unknown} expected Value that must differ. @returns {void} */
        toBe: (expected) => assert(!Object.is(actual, expected), `Expected ${formatValue(actual)} not to be ${formatValue(expected)}.`),
        /** Asserts structural inequality. @param {unknown} expected Value that must differ. @returns {void} */
        toEqual: (expected) => assert(!deepEqual(actual, expected), `Expected ${formatValue(actual)} not to equal ${formatValue(expected)}.`),
        /** Asserts that a string or array does not contain a value. @param {unknown} expected Value that must be absent. @returns {void} */
        toContain: (expected) => {
            const contains = typeof actual === 'string'
                ? actual.includes(expected)
                : Array.isArray(actual)
                    ? actual.some((item) => deepEqual(item, expected))
                    : false;
            assert(!contains, `Expected ${formatValue(actual)} not to contain ${formatValue(expected)}.`);
        },
        /** Asserts that a function does not throw. @returns {void} */
        toThrow: () => {
            assert(typeof actual === 'function', 'not.toThrow expects a function.');
            let thrown;
            try {
                actual();
            } catch (error) {
                thrown = error;
            }
            assert(thrown === undefined, `Expected the function not to throw, but it threw ${formatError(thrown)}.`);
        },
        /** Asserts that a function or promise resolves. @returns {Promise<void>} Resolves when the assertion finishes. */
        toThrowAsync: async () => {
            assert(
                typeof actual === 'function' || actual instanceof Promise,
                'not.toThrowAsync expects a function or a promise.'
            );
            let thrown;
            try {
                await (typeof actual === 'function' ? actual() : actual);
            } catch (error) {
                thrown = error;
            }
            assert(thrown === undefined, `Expected the function or promise not to reject, but it rejected with ${formatError(thrown)}.`);
        }
    };

    return {
        toBe,
        toEqual,
        toContain,
        toInclude: toContain,
        toThrow,
        toThrowAsync,
        not
    };
};

/**
 * Returns an immutable snapshot of the current run.
 *
 * @returns {{ passed: number, failed: number, failures: Array<{ test: string, error: unknown }> }}
 */
export const getResults = () => ({
    passed: results.passed,
    failed: results.failed,
    failures: results.failures.map(({ test, error }) => ({ test, error }))
});

/**
 * Clears all results and hooks. Useful before a fresh run in the same page.
 *
 * @returns {void}
 */
export const reset = () => {
    results = createResults();
    hooks = { beforeEach: null, afterEach: null };
};

/**
 * Runs a test against an isolated result store, so a deliberate failure proves
 * the harness works without turning the real suite red.
 *
 * @param {string} description Test description.
 * @param {() => void | Promise<void>} test Test body.
 * @returns {Promise<{ passed: number, failed: number, failures: Array<{ test: string, error: unknown }> }>}
 */
export const runIsolated = async (description, test) => {
    const previousResults = results;
    const previousHooks = hooks;
    const isolatedResults = createResults();
    results = isolatedResults;
    hooks = { beforeEach: null, afterEach: null };
    try {
        await it(description, test);
        return isolatedResults;
    } finally {
        results = previousResults;
        hooks = previousHooks;
    }
};

/**
 * Prints the final summary. Throws an `AggregateError` when any test failed,
 * so the browser console cannot mistake the run for a success.
 *
 * @returns {void}
 * @throws {AggregateError} When one or more tests failed.
 */
export const report = () => {
    const summary = getResults();
    if (summary.failed === 0) {
        console.info(`[PASS] ${summary.passed} test(s) passed.`);
        return;
    }
    console.error(`[FAIL] ${summary.failed} test(s) failed, ${summary.passed} passed.`);
    summary.failures.forEach(({ test, error }) => {
        console.error(`  - ${test}: ${formatError(error)}`);
    });
    throw new AggregateError(
        summary.failures.map(({ error }) => error),
        `${summary.failed} test(s) failed.`
    );
};

/**
 * Creates a controllable promise for tests that need to resolve or reject at a
 * precise moment.
 *
 * @returns {{ promise: Promise<unknown>, resolve: (value?: unknown) => void, reject: (reason?: unknown) => void }}
 */
export const deferred = () => {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
};

/**
 * Creates a call-recording function.
 *
 * @param {(...args: unknown[]) => unknown} [implementation] Optional real behavior.
 * @returns {Function & { calls: unknown[][], calledWith: (...args: unknown[]) => boolean, reset: () => void }}
 */
export const spy = (implementation = () => undefined) => {
    const spyFunction = (...args) => {
        spyFunction.calls.push(args);
        return implementation(...args);
    };
    spyFunction.calls = [];
    spyFunction.calledWith = (...expectedArgs) => spyFunction.calls.some((args) => deepEqual(args, expectedArgs));
    spyFunction.reset = () => {
        spyFunction.calls.length = 0;
    };
    return spyFunction;
};

/**
 * Creates an in-memory `localStorage` replacement.
 *
 * @param {Record<string, string>} [initialValues] Values available on creation.
 * @returns {{ getItem: Function, setItem: Function, removeItem: Function, clear: Function, key: Function, readonly length: number }}
 */
export const fakeStorage = (initialValues = {}) => {
    const values = new Map(Object.entries(initialValues));
    return {
        /** @param {string} key Storage key. @returns {string | null} Stored value or null. */
        getItem: (key) => (values.has(key) ? values.get(key) : null),
        /** @param {string} key Storage key. @param {string} value Value to store. @returns {void} */
        setItem: (key, value) => {
            values.set(key, String(value));
        },
        /** @param {string} key Storage key. @returns {void} */
        removeItem: (key) => {
            values.delete(key);
        },
        /** @returns {void} */
        clear: () => {
            values.clear();
        },
        /** @param {number} index Position. @returns {string | null} Key at the position. */
        key: (index) => Array.from(values.keys())[index] ?? null,
        /** @returns {number} Number of stored keys. */
        get length() {
            return values.size;
        }
    };
};

/**
 * Creates a fetch double that resolves with a controlled response.
 *
 * @param {{ ok?: boolean, status?: number, statusText?: string, data?: unknown }} [response] Response shape.
 * @returns {() => Promise<{ ok: boolean, status: number, statusText: string, json: () => Promise<unknown> }>}
 */
export const fakeFetch = ({ ok = true, status = 200, statusText = 'OK', data = null } = {}) => {
    return async () => ({
        ok,
        status,
        statusText,
        json: async () => data
    });
};

/**
 * Runs a function while `console.error` is muted, then restores it. Returns the
 * function result so expected error paths can still be asserted.
 *
 * @param {() => unknown | Promise<unknown>} fn Function to run silently.
 * @returns {Promise<unknown>} The function result.
 */
export const silenced = async (fn) => {
    const realConsoleError = console.error;
    console.error = () => { };
    try {
        return await fn();
    } finally {
        console.error = realConsoleError;
    }
};
