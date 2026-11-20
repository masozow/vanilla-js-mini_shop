import { describe, it, silenced, expect } from '../../miniTest.js';
import { CartItem } from '../../../../features/cart/domain/CartItem.js';
import { formatCartItemNumbers } from '../../../utils/moneyFormatter.js';
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
        const { displayPrice, displayQuantity, displaySubTotal } = formatCartItemNumbers({ quantity, price, subTotal });
        expect(displayPrice).toBe(price / 100);
        expect(displayQuantity).toBe(quantity / 100);
        expect(displaySubTotal).toBe(subTotal / (100 * 100))
    })
    await it('Checking for correct mapping and arithmetic operations', async () => {
        const { id, name, price, quantity, subTotal } = CartItem(mockItems[0]);
        const { displayPrice, displayQuantity, displaySubTotal } = formatCartItemNumbers({ quantity, price, subTotal });
        expect(id).toBe(1);
        expect(name).toBe('Apple MagSafe Battery Pack - Apple');
        expect(displayPrice).toBe(99.99);
        expect(displayQuantity).toBe(5);
        expect(displaySubTotal).toBe(499.95);
    })

})