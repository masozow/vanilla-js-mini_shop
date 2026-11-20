import {
    describe,
    it,
    expect,
    runIsolated,
    getResults,
    spy,
    deferred,
    fakeStorage,
    fakeFetch
} from './miniTest.js';

/**
 * Meta-tests for the harness itself. This file is intentionally not imported by
 * `index.js` by default: uncomment its import there to prove that the harness
 * catches failures without turning the real suite red.
 */
await describe('Test harness tests', async () => {
    await it('records a deliberate failure in isolation', async () => {
        const failuresBefore = getResults().failed;
        const isolated = await runIsolated('deliberate harness failure', () => {
            throw new Error('expected failure');
        });
        expect(isolated.failed).toBe(1);
        expect(isolated.failures[0].test).toBe('deliberate harness failure');
        expect(getResults().failed).toBe(failuresBefore);
    });

    await it('compares objects and arrays structurally', () => {
        expect({ id: 1, tags: ['a', 'b'] }).toEqual({ id: 1, tags: ['a', 'b'] });
        expect({ id: 1 }).not.toEqual({ id: 2 });
    });

    await it('detects contained values in strings and arrays', () => {
        expect('cart history').toContain('history');
        expect([{ id: 1 }, { id: 2 }]).toContain({ id: 2 });
        expect([1, 2, 3]).not.toContain(4);
    });

    await it('detects synchronous throws', () => {
        expect(() => {
            throw new Error('boom');
        }).toThrow('boom');
        expect(() => 'no error').not.toThrow();
    });

    await it('detects asynchronous rejections', async () => {
        await expect(async () => {
            throw new Error('async boom');
        }).toThrowAsync('async boom');
    });

    await it('records spy calls and arguments', () => {
        const addToCart = spy((quantity) => quantity * 2);
        expect(addToCart(3)).toBe(6);
        expect(addToCart.calls.length).toBe(1);
        expect(addToCart.calledWith(3)).toBe(true);
    });

    await it('stores values with the fake storage', () => {
        const storage = fakeStorage({ cart: '[]' });
        storage.setItem('cart', '[{"id":1}]');
        expect(storage.getItem('cart')).toBe('[{"id":1}]');
        expect(storage.length).toBe(1);
        storage.removeItem('cart');
        expect(storage.getItem('cart')).toBe(null);
    });

    await it('resolves fake fetch responses', async () => {
        const fetch = fakeFetch({ status: 201, statusText: 'Created', data: { id: 1 } });
        const response = await fetch();
        expect(response.status).toBe(201);
        expect(await response.json()).toEqual({ id: 1 });
    });

    await it('resolves a deferred promise on demand', async () => {
        const pending = deferred();
        pending.resolve('done');
        expect(await pending.promise).toBe('done');
    });
});
