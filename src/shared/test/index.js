import { report } from './miniTest.js';

console.log("====== TESTS SUITE BEGINS ======");

await import('./shared/utils/escapeHTML.test.js');
await import('./shared/infrastructure/HttpClient.test.js');
await import('./shared/utils/debounce.test.js');
await import('./features/cart/CartItem.test.js');
await import('./features/cart/CartService.test.js');
await import('./features/product/ProductService.test.js');

// The harness meta-test proves that failures are detected. It is intentionally
// commented out so the normal suite stays green; uncomment it to verify the
// harness itself. Keep the import here, not in a separate test page.
// await import('./harness.test.js');

console.log("====== TEST SUITE ENDS ======");
report();
