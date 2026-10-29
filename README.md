# Mini shop: product search and cart, two features, one architecture

## 1. The exercise

Use this URL to build a **product search** and a **shopping cart** on the same page:

| Feature  | URL                                             |
| -------- | ----------------------------------------------- |
| Products | `https://dummyjson.com/products/search?q=phone` |
| Cart     | none: it lives in the browser                   |

### How the page behaves

The page has two sections:

- **Products**: search box + results.
- **Cart**: the products the user added, with their quantities and a total.

The two features are **connected by one action only**: the _Add to cart_ button on a product card. Everything else is separate:

1. Typing in the search box only updates the Products results. Adding, removing or changing the quantity of a cart line only updates the Cart. A new search never touches the cart, and a cart change never re-renders the results.
2. Products has its own Loading, Empty and Error states. The cart has its own empty state ("Your cart is empty").
3. The cart keeps its own state: it survives any number of searches.
4. Both start empty. Nothing is fetched on page load, and only Products ever uses the network.

Example: type `phone` in the search box and add the first result twice: the cart shows **one** line with quantity 2. Now search `laptop`: the results change and the cart does not.

**Not part of this exercise:** checkout or payment, user accounts, discounts or taxes, a quantity field on the product card, limiting the quantity to the available stock, or DummyJSON's fake `/carts` endpoints. The cart is local.

**Why two features connected by one action?** The point is the structure, not the product. Once Products works, adding the cart should cost a new folder and one line in `main.js`, without Products importing the cart (or the other way around). Something outside both features connects them. You can build Products first and add the cart at the end.

For the **product search**:

1. A search box. The search runs every time the user presses a key (debounced, so it does not fire on every single keystroke).
2. A responsive grid of cards. Each card shows the image (with a proper `alt`), the title, the price and an _Add to cart_ button.
3. The results area is **empty when the search box is empty**.
4. Show distinct _Loading_, _No results_ and _Error_ states.
5. A slow, older response must never overwrite a newer one.
6. A product with `stock` 0 is shown as out of stock and cannot be added.
7. The API is untrusted input: no HTML injection (XSS).

For the **cart**:

1. Each line shows the image, the title, the unit price, the quantity and the line total. Below the lines, the cart total.
2. Adding a product that is already in the cart increases its quantity; it does not create a second line.
3. The user can increase, decrease and remove. Decreasing a line with quantity 1 removes it.
4. The cart is kept **after every search** and **after reloading the page**.
5. Prices are shown like `$1,099.99`, and totals must be exact (think about `0.1 + 0.2`).
6. The cart also renders data that came from the API (and from storage): the same XSS rule applies.

Relevant fields:

| Product (from the API)                                                                      | Cart line                                          |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `id`, `title`, `price`, `thumbnail`, `stock`                                                | `id`, `title`, `price`, `thumbnail`, `quantity`    |
| Everything else (`brand`, `rating`, `category`...) is **optional**: never print `undefined` | `quantity` belongs to the cart, not to the product |

Page requirements (this is what the role is about):

- No horizontal scroll at 360 px wide; the grid adapts by itself, and on wide screens the cart sits next to the results.
- Images must not make the layout jump while loading, and images below the fold must not slow the first paint.
- Usable with a keyboard; semantic HTML; the search box has a label; the quantity buttons have an accessible name.

Constraints: no frameworks, no libraries, no build step. ES modules and the browser DevTools are fine.

Begin from the simple: make it work first, refactor later. If time is short, make the Products search work end to end first, then the cart. Your final solution should apply design and architectural patterns with **testability, decoupling and SOLID** in mind.

**Definition of done**

- [ ] Typing shows product cards; clearing the box empties the results
- [ ] Loading, empty and error states work (try the offline mode in DevTools)
- [ ] Typing fast never shows results for an older query
- [ ] Adding the same product twice shows one line with quantity 2
- [ ] Increase, decrease (at 1 it removes) and remove work, and every total is exact
- [ ] The cart survives a new search and survives a reload
- [ ] A product with `stock` 0 cannot be added (try the query `phone`)
- [ ] Products and Cart do not import each other (check your imports)
- [ ] `<img onerror=...>` typed into the search box or returned by the API does not execute
- [ ] Looks right at 360 px and at 1440 px

---

## 2. API cheat sheet

No API key. Open the URL in a browser tab **before** writing code.

|                  | Products                                        | Cart                                   |
| ---------------- | ----------------------------------------------- | -------------------------------------- |
| Search           | `https://dummyjson.com/products/search?q=phone` | no request: it lives in the browser    |
| List lives under | `products`                                      | -                                      |
| Image field      | `thumbnail` (also `images[]`)                   | a copy of the product's `thumbnail`    |
| Text fields      | `title`, `category`, `brand`                    | a copy of the product's `title`        |
| Numbers          | `price`, `stock`, `rating`, `id`                | `quantity` (a whole number, 1 or more) |

Notes:

- The response is an **object**, not an array: `{ "products": [...], "total": 23, "skip": 0, "limit": 23 }`. Unwrapping it is the repository's job.
- `price` is a number in **dollars** with decimals (for example `549.99`). Money and floating point do not mix well (`0.1 + 0.2 !== 0.3`): decide where you convert it, and do it once.
- Search is done by the **server** (`q`), so you do not download the whole catalog to filter it in the browser.
- Try the query `phone`: one of its results has `stock: 0` (`"availabilityStatus": "Out of Stock"`). That is your test data for the out-of-stock rule.
- Optional query params described in the docs: `limit`, `skip`, `select`, `sortBy` and `order`. Check in the Network tab that they really work on `/products/search` before relying on them.
- Images are hosted on DummyJSON's own CDN (`https://cdn.dummyjson.com/...`, `.webp` files). Open one in a tab and look at its size: it tells you why `thumbnail` beats `images[0]` in a grid.
- Docs: <https://dummyjson.com/docs/products>
