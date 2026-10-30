export const describe = async (testGroupDescription, fn) => {
    console.group(testGroupDescription)
    await fn();
    console.groupEnd()
}
export const it = async (testDescription, fn) => {
    try {
        await fn();
        console.log(`[1] ${testDescription}`)
    } catch (error) {
        console.error(`[0] ${testDescription} error - ${error}`)
    }
}

export const expect = (actual) => {
    return {
        toBe: (expected) => {
            if (actual !== expected) throw new Error(`Expected: ${expected}, but received: ${actual}`);
        }
    }
}

export const silenced = async (fn) => {
    let realConsoleError = console.error;
    console.error = () => { };
    try {
        await fn();
    } finally {
        console.error = realConsoleError;
    }
}