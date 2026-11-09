import { describe, it, silenced, expect } from '../../miniTest.js';
import { CartItem, CartItemNumbersToRender } from '../../../../features/cart/domain/CartItem.js';
await describe('Cart Item tests', async () => {
    const mockItems = [{
        id: 1,
        name: 'Apple MagSafe Battery Pack - Apple',
        price: '99.99',
        quantity: '5'
    },
    {
        id: 2,
        name: 'Beats Flex Wireless Earphones - Beats',
        price: '49.99',
        quantity: '50',
    },
    {
        id: 3,
        name: 'Selfie Stick Monopod - SnapTech',
        price: '12.99',
        quantity: '11',
        isDisabled: true
    },
    {
        id: 4,
        name: 'iPhone X - Apple',
        price: '899.99',
        quantity: '37',
        isDisabled: true
    },
    {
        id: 5,
        name: 'Essence Mascara Lash Princess - Essence',
        price: '9.99',
        quantity: '9'
    }]
    await it('Floating point render function', async () => {
        const { price, quantity, subTotal } = CartItem(mockItems[0]);
        const { correctedPrice, correctedQuantity, correctedSubTotal } = CartItemNumbersToRender({ quantity, price, subTotal });
        expect(correctedPrice).toBe(price / 100);
        expect(correctedQuantity).toBe(quantity / 100);
        expect(correctedSubTotal).toBe(subTotal / (100 * 100))
    })
    await it('Checking for correct mapping and arithmetic operations', async () => {
        const { id, name, price, quantity, subTotal } = CartItem(mockItems[0]);
        const { correctedPrice, correctedQuantity, correctedSubTotal } = CartItemNumbersToRender({ quantity, price, subTotal });
        expect(id).toBe(1);
        expect(name).toBe('Apple MagSafe Battery Pack - Apple');
        expect(correctedPrice).toBe(99.99);
        expect(correctedQuantity).toBe(5);
        expect(correctedSubTotal).toBe(499.95);
    })

})