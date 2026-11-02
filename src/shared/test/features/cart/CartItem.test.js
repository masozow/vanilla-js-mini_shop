import { describe, it, silenced, expect } from '../../miniTest.js';
import { CartItem } from '../../../../features/cart/domain/CartItem.js';
await describe('Cart Item tests', async () => {
    const mockItems = [{
        id: 1,
        name: 'Apple MagSafe Battery Pack - Apple',
        price: '99.99',
        quantity: '5'
    }]
    await it('Happy path', async () => {
        const { id, name, price, quantity, subTotal } = CartItem(mockItems[0]);
        expect(id).toBe(1);
        expect(name).toBe('Apple MagSafe Battery Pack - Apple');
        expect(price).toBe(99.99);
        expect(quantity).toBe(5);
        expect(subTotal).toBe(499.95);
    })
})