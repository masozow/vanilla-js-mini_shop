import { describe, it, expect, silenced } from "../../miniTest.js";
import { CartService } from "../../../../features/cart/application/CartService.js";
await describe('CartService tests', async () => {
    const FakeLocalRepo = (key) => {
        let tempStorage = {
            [key]: []
        }
        return {
            getCart: () => {
                return tempStorage[key];
            },
            setCart: (value) => {
                tempStorage[key] = value;
            }
        }
    }
    const cartLocalRepo = FakeLocalRepo('cart');
    const { handleCart } = CartService({ cartLocalRepo });
    const Items = [{
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
        isDisabled: true
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
        quantity: '37'
    },
    {
        id: 5,
        name: 'Essence Mascara Lash Princess - Essence',
        price: '9.99',
        quantity: '9'
    }
    ]
    await it('Add items to cart', async () => {
        handleCart({ newItem: Items[0] });
        expect(cartLocalRepo.getCart().length).toBe(1);
        expect(cartLocalRepo.getCart()[0].id).toBe(Items[0].id);
    });

    await it('Remove item from cart if it already exists (Toggle behavior)', async () => {
        handleCart({ newItem: Items[1] });
        expect(cartLocalRepo.getCart().length).toBe(2);
        handleCart({ newItem: Items[1] });
        expect(cartLocalRepo.getCart().length).toBe(1);
        expect(cartLocalRepo.getCart()[0].id).toBe(Items[0].id);
    });
});