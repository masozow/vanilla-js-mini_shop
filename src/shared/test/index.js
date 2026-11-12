console.log("====== TESTS SUITE BEGINS ======");

await import('./shared/utils/escapeHTML.test.js');
await import('./shared/infrastructure/HttpClient.test.js');
await import('./shared/utils/debounce.test.js');
await import('./features/cart/CartItem.test.js');
await import('./features/cart/CartService.test.js');

console.log("====== TEST SUITE ENDS ======");
