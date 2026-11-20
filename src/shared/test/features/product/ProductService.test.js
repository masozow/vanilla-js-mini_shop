import { describe, it, expect, beforeEach, spy } from '../../miniTest.js';
import { ProductService } from '../../../../features/product/application/ProductService.js';

/**
 * Creates a product repository double with a fixed catalog.
 *
 * @param {Array<object>} products Products returned for every search.
 * @returns {{ getItems: () => Promise<Array<object>> }} Repository double.
 */
const createProductRepository = (products = []) => ({
    getItems: async () => products
});

await describe('ProductService picked projection', async () => {
    let service;
    let pickedChanges;

    beforeEach(() => {
        service = ProductService({ productRepo: createProductRepository() });
        pickedChanges = spy();
        service.onPickedProductsChange(pickedChanges);
        // `createSignal` calls a new subscriber immediately with the current
        // value. The projection starts empty, so that first call is noise.
        pickedChanges.reset();
    });

    await it('emits every id when the projection starts empty', async () => {
        service.setPickedIds([1, 2]);

        expect(pickedChanges.calls.length).toBe(1);
        expect(pickedChanges.calls[0][0]).toEqual([
            { id: 1, picked: true },
            { id: 2, picked: true }
        ]);
    });

    await it('emits only the ids whose membership changed', async () => {
        service.setPickedIds([1, 2]);
        pickedChanges.reset();

        service.setPickedIds([2, 3]);

        expect(pickedChanges.calls.length).toBe(1);
        expect(pickedChanges.calls[0][0]).toEqual([
            { id: 1, picked: false },
            { id: 3, picked: true }
        ]);
    });

    await it('emits nothing when the set is unchanged', async () => {
        service.setPickedIds([1, 2]);
        pickedChanges.reset();

        service.setPickedIds([2, 1]);

        expect(pickedChanges.calls.length).toBe(0);
    });

    await it('ignores ids that are not positive integers', async () => {
        service.setPickedIds([1, '2', Number.NaN, null, undefined, -1, 1.5]);

        expect(pickedChanges.calls[0][0]).toEqual([
            { id: 1, picked: true },
            { id: 2, picked: true }
        ]);
    });

    await it('uses the cache to mark products on the next render', async () => {
        const products = [
            { id: 1, title: 'First', price: 10, thumbnail: 'first.png', stock: 5 },
            { id: 2, title: 'Second', price: 20, thumbnail: 'second.png', stock: 5 }
        ];
        service = ProductService({ productRepo: createProductRepository(products) });
        service.setPickedIds([2]);

        let lastState;
        service.onProductChange((state) => {
            lastState = state;
        });

        await service.search('second');

        expect(lastState.products[0].picked).toBe(false);
        expect(lastState.products[1].picked).toBe(true);
    });
});
