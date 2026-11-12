import { describe, it, expect, silenced } from "../../miniTest.js";
import { CartService } from "../../../../features/cart/application/CartService.js";
import { CartItem } from "../../../../features/cart/domain/CartItem.js";
await describe('CartService tests', async () => {
    const FakeLocalRepo = (key) => {
        let tempStorage = {
            [key]: []
        }
        return {
            getCart: () => {
                return structuredClone(tempStorage[key]);
            },
            setCart: (value) => {
                tempStorage[key] = structuredClone(value);
            }
        }
    }
    const cartLocalRepo = FakeLocalRepo('cart');
    const { addToCart, removeFromCart, cleanCart } = CartService({ cartLocalRepo });
    const RawItems = [{
        id: 1,
        name: 'Apple MagSafe Battery Pack - Apple',
        price: '99.99',
        quantity: '5',
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
    }
    ]
    const Items = RawItems.map((item) => CartItem(item));
    await it('Add items to cart', async () => {
        addToCart({ newItem: Items[0] });
        expect(cartLocalRepo.getCart().length).toBe(1);
        expect(cartLocalRepo.getCart()[0].id).toBe(Items[0].id);
        addToCart({ newItem: Items[1] });
        expect(cartLocalRepo.getCart().length).toBe(2);
        expect(cartLocalRepo.getCart()[1].id).toBe(Items[1].id);
    });

    await it('Increment quantity and subtotal of an already existing element', async () => {
        addToCart({ newItem: Items[1] });
        expect(cartLocalRepo.getCart().length).toBe(2);
        expect(cartLocalRepo.getCart()[1].quantity).toBe(2 * Items[1].quantity);
    });
    await it('Put quantity and subTotal to 0 if we remove the item', async () => {
        removeFromCart(Items[1].id);
        expect(cartLocalRepo.getCart().length).toBe(2);
        expect(cartLocalRepo.getCart()[1].quantity).toBe(0);
        expect(cartLocalRepo.getCart()[1].isDisabled).toBe(true);
    })
    await it('Creating a new registry of a removedItem', async () => {
        addToCart({ newItem: Items[1] });
        expect(cartLocalRepo.getCart().length).toBe(3);
        expect(cartLocalRepo.getCart()[1].id).toBe(cartLocalRepo.getCart()[2].id)
        expect(cartLocalRepo.getCart()[2].quantity).toBe(Items[1].quantity);
        expect(cartLocalRepo.getCart()[2].subTotal).toBe(Items[1].subTotal);
    })
    await it('Clean cart completely', async () => {
        cleanCart();
        expect(cartLocalRepo.getCart().length).toBe(0);
    })
});