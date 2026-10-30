import { describe, it, expect, silenced } from "../../miniTest.js";
import { HttpClient } from "../../../infrastructure/HttpClient.js";
const mockData = {
    products: [{
        id: 1, title: 'Couch', price: '20.00',
        category: 'Furniture',
        rating: '5',
        thumbnail: '',
        isFavorite: false,
    },
    {
        id: 2, title: 'iPhone', price: '50.00',
        category: 'Tech',
        rating: '9',
        thumbnail: '',
        brand: 'Apple',
        isFavorite: true,
    }
    ]
}
const fakeUrl = 'https://nourl.com';
const fakeFetchFactory = ({ ok = true, status = 200, statusText = '', data = [] }) => {
    const returnData = {
        ok,
        status,
        statusText,
        json: async () => data
    }
    return async () => returnData;
}
await describe('HttpClient tests', async () => {
    await it('Happy path', async () => {
        //1. Arrange
        const fetcher = fakeFetchFactory({ data: mockData });
        //2. Act
        const response = await HttpClient({ url: fakeUrl, fetch: fetcher });
        const { products } = response;
        //3. Assert
        expect(products[0].title).toBe('Couch');
        expect(products.length).toBe(2);
    });
    await it('Error path', async () => {
        //1.Arrange
        const fakeFetch = fakeFetchFactory({ ok: false, status: 500, statusText: 'Server error', data: mockData });
        //2.Act
        try {
            await silenced(() => HttpClient({ url: fakeUrl, fetch: fakeFetch }));
        } catch (error) {
            //3.Assert  
            expect(error.message.includes('[Shared Infra Error] HttpClient. Status: 500')).toBe(true);
        }
    })
});