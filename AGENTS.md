# AGENTS.md — Hallazgos de auditoría y plan de trabajo

Documento de traspaso para retomar el trabajo. Fecha: 2026-11-16.

- Rama: `dev`
- HEAD: `0ddc463` — `FIX: starting to use cart as single source of truth for picked products`
- Árbol de trabajo: limpio.
- Suite actual: `node src/shared/test/index.js` → **13/13 tests pasan**.
- La revisión original se hizo sobre copias; este documento actualiza su estado contra el código actual.

> Importante: los 13 tests no cubren `ProductService`, el cableado de `main.js`, el mapper, el almacenamiento corrupto ni la re-entrada de signals. Que pasen no significa que las grietas estén resueltas.

---

## 1. Cambios aplicados en `0ddc463` y su efecto

Archivos: `CartService`, `ProductService`, `ProductController`, `main.js`.

1. `ProductService.setPickedIds(ids)` reemplaza la lista de ids marcados.
2. `pickProductQuantity` ya no modifica `pickedProductsIdList`; solo emite `lastPickedProductSignal`.
3. `main.js` sincroniza `cartService.onCartChange` → `productService.setPickedIds(ids activos)`.
4. Se agregó un `console.log` de depuración en `CartService.removeFromCart`.

Efecto real: el carrito pasa a ser el origen de los ids activos, lo cual es la dirección correcta. Pero la implementación quedó a mitad:

- `setPickedIds` solo actualiza una caché; **no emite ningún signal**. La UI de productos sigue actualizándose por el camino viejo (`onProductPicked`).
- El rebote de quitar desde el carrito sigue existiendo (ver 3.2).
- `main.js` sigue conteniendo el flujo y el puente entre features.
- El `console.log` nuevo es ruido de depuración.

---

## 2. Scorecard de desacople (actualizado)

| Regla | Estado | Evidencia |
|---|---|---|
| Una feature no importa a otra | ✅ | 0 imports entre features; solo `main.js` las compone |
| Cada feature funciona sola (prueba de borrado) | ✅ | product, cart y checkout no se importan entre sí |
| `domain` sin dependencias externas | ✅ | solo importa otros módulos del propio dominio |
| `application` sin UI, infra ni DOM | ✅ | quedan `console.*` de depuración |
| `ui` sin `infrastructure` | ✅ | — |
| `shared` no depende de features | ❌ | único caso: `src/shared/mappers/ProductToCart.mapper.js` importa `features/cart/domain/CartItem.js` |
| Dependencias inyectadas | ⚠️ | `HttpClient`, `fetch`, repos y callbacks sí; `LocalCartRepository` usa `localStorage` global |
| Una sola fuente de verdad | ⚠️ | el carrito ya es origen de ids, pero quedan dos caminos de escritura y el rebote |
| Dominio libre de UI | ❌ | `Product.picked`, `Product.dimensions`, `CartItem.isDisabled`, `CartItemNumbersToRender` |

Verificación del único import `shared → feature`:

```bash
grep -rn "features/" src/shared --include=*.js | grep -v "test/"
# src/shared/mappers/ProductToCart.mapper.js:1
```

---

## 3. Las seis grietas

### 3.1 El mapper vive en `shared` y conoce `cart` — ABIERTA

- `src/shared/mappers/ProductToCart.mapper.js:1-2` importa `CartItem`.
- Es el único import de `shared` hacia una feature.
- `main.js:2` lo importa para convertir producto → línea de carrito.

Dirección recomendada:

1. Mover el mapper a una carpeta de composición, p. ej. `src/composition/toCartLine.js`.
2. Mejor aún: que `CartService.addToCart` reciba datos planos `{ id, name, price, quantity }` y construya el `CartItem` por dentro. El mapper de composición solo formatea datos y **no importa nada de cart**.
3. Ojo con el escalado: los tests actuales pasan objetos `CartItem` ya escalados. Si `addToCart` empieza a construir el `CartItem`, hay que actualizar los tests a datos crudos o se escala dos veces.

### 3.2 Dos fuentes de verdad y rebote — PARCIAL (y discrepancia de verificación)

Lo que ya está bien:

- `setPickedIds` elimina la escritura de la lista de ids desde `ProductService`.
- Al arrancar, `createSignal.subscribe` invoca el listener inmediatamente, así que el carrito cargado de `localStorage` llega a productos.
- Tras una búsqueda nueva, `productsDisplayState` marca `picked` usando los ids del carrito.

Lo que sigue mal:

- `main.js:16-18` sigue pasando `onRemoveItemIntent` a `CartModule`.
- `CartController.js:113-129` ejecuta `removeFromCart` y después `onRemoveItemIntent`.
- `main.js:24-31` reacciona a `onProductPicked` y, si `picked === false`, vuelve a llamar `cartService.removeFromCart`.
- `ProductService` sigue usando `lastPickedProductSignal` como canal de eventos (`onProductPicked`, `pickProductQuantity`).
- `setPickedIds` no emite signal, así que las tarjetas visibles solo cambian por el camino viejo. Hay dos mecanismos de sincronización.
- `onItemIdRemoved` existe y lo usa `CartController` para la fila, pero `main.js` no lo usa como evento de dominio.

#### Discrepancia sobre el doble `removeFromCart`

El usuario probó en navegador y no vio ningún `console.log` duplicado. La verificación posterior con el `ProductController` real y un DOM mínimo confirma que **el doble llamado sí ocurre, pero es condicional**:

- Ocurre cuando el producto quitado **está en los resultados de búsqueda actuales** (`productSignal.get().products` lo contiene) y su tarjeta existe en el DOM.
- No ocurre si el producto no está en los resultados actuales: `pickProductQuantity` hace `return` porque `clickedProduct` es `undefined`.
- Tampoco ocurre si la tarjeta no está en el DOM: `ProductController` retorna antes de emitir el intent.

Reproducción fiel (servicios reales + `ProductController` real):

```text
RemoveFromCart called for ID: 1
INTENT picked=false
RemoveFromCart called for ID: 1
```

Cómo comprobarlo en el navegador:

1. Buscar `phone`.
2. Agregar un producto al carrito.
3. Sin cambiar la búsqueda, quitarlo desde el carrito.
4. Consola: aparecen dos `RemoveFromCart called for ID: ...`.
5. Si antes de quitarlo se hace otra búsqueda que no lo incluya, aparece uno solo.

Por qué es fácil no verlo: el segundo llamado es idempotente con el borrado lógico actual. La fila ya está `isDisabled`, así que se vuelve a desactivar sin cambio visual; solo hay doble escritura en `localStorage` y doble emisión de `lastRemovedItemIdSignal`.

Dirección recomendada:

1. Eliminar `onRemoveItemIntent` de `CartController` y `CartModule`; el clic solo llama `removeFromCart`.
2. Eliminar `lastPickedProductSignal`, `onProductPicked` y `pickProductQuantity` de `ProductService`.
3. `ProductController` emite un intent de agregar `{ product, quantity }` (o solo `{ product }` si se quita el input, ver 3.4).
4. `setPickedIds(ids)` debe emitir un signal de ids; `ProductController` actualiza solo las tarjetas visibles (clase/texto), **sin re-renderizar la grilla**, para respetar el README: “un cambio del carrito nunca re-renderiza los resultados”.
5. Quitar → solo carrito → ids → productos. Agregar → intent → carrito → ids → productos. Un solo sentido.

Nota extra: `onProductPicked` se suscribe con el valor inicial `{}`, que es truthy. Hoy no rompe porque `querySelector('[data-id="undefined"]')` devuelve `null`, pero es frágil. Si se mantiene ese canal, validar `id`.

### 3.3 `main.js` contiene lógica de flujo — ABIERTA

- `onRemoveItemIntent` (`main.js:16-18`) usa `productService` antes de declararlo (`main.js:32`). Funciona solo por el orden temporal de los clics; si se hace clic mientras `ProductModule` aún carga, es un `ReferenceError` en TDZ y el listener está fuera del `try/catch`.
- `onProductPickedIntent` (`main.js:24-31`) es el puente producto → carrito.
- `onPurchaseDone` y `onClearIntent` (`main.js:33-40`) contienen el flujo de compra.
- Todo vive en closures dentro de `DOMContentLoaded`; no se puede importar ni testear.

Dirección recomendada: extraer a `src/composition/`:

- `connectProductsToCart({ productService, cartService })`
- `connectCartToCheckout({ cartService, checkoutService })`
- `createCheckoutHandlers({ cartService, productService })`
- `toCartLine(product)`

`main.js` debe quedar con: obtener nodos DOM, crear módulos, llamar a los conectores. Sin lógica de flujo.

### 3.4 La cantidad viaja por el DOM — PARCIAL

- `ProductController.js:31` lee `input.value`.
- `ProductController.js:34` manda `{ ...lastPickedProduct, quantity }` al intent.
- `ProductView.js:22` resetea el input en el mismo paso.
- `ProductService.pickProductQuantity` ya no acepta `quantity`, pero la cantidad sigue viniendo del DOM y viajando por el evento.

Dato clave del README: **un campo de cantidad en la tarjeta de producto no forma parte del ejercicio**. La solución más limpia es quitar el input de `ProductCard` y agregar siempre `1`; el carrito ya fusiona líneas repetidas.

Alternativa si se quiere conservar el campo: el controller debe mandar la cantidad explícita en el intent, y ningún servicio debe leer el DOM ni ignorar parte de su firma.

### 3.5 Fugas hacia el dominio — ABIERTA

- `src/features/product/domain/Product.js:1,15-16`: `picked` y `dimensions` son estado de UI / datos que no se usan.
- `src/features/cart/domain/CartItem.js:12`: `isDisabled` es un borrado lógico que existe por la UI. Las filas quitadas quedan en la lista y en `localStorage`.
- `src/features/cart/domain/CartItem.js:17-19`: `CartItemNumbersToRender` convierte para mostrar dentro del dominio.
- `src/features/cart/domain/CartCalculations.js:6-11`: `correctCartTotalsForDisplay` también es formateo de UI dentro del dominio.
- Escala monetaria `100` / `10000` repetida en `CartItem.js` y `CartCalculations.js`; merece una constante única (`MONEY_SCALE`, `CENT_SCALE` o helpers `toCents` / `fromCents`).
- `CartRow.js:2` importa `CartItemNumbersToRender` desde el dominio.

Decisión pendiente: borrado real vs. borrado lógico (ver sección 7).

### 3.6 `createSignal` y re-entrada — ABIERTA

`src/shared/store/createSignal.js:4-6`:

```js
const notify = (currentValue) => {
    listeners.forEach(listener => listener(currentValue));
}
```

El valor se captura antes del bucle. Verificado: un listener cambió el signal a `b`; el siguiente listener recibió `a`, aunque `get()` ya devolvía `b`.

Arreglo mínimo: notificar leyendo el valor vivo dentro del bucle (`listeners.forEach(l => l(value))`) y, opcionalmente, una guarda para evitar re-entrada anidada. Test de re-entrada pendiente.

Además, `CartService.js:12` expone `cartItems: cartSignal.get()` calculado una sola vez y nadie lo usa. Eliminar.

---

## 4. Bugs verificados

| Bug | Estado | Evidencia / arreglo |
|---|---|---|
| `alt="${title}"` sin `esc` ejecuta HTML | ❌ Abierto | Verificado: `alt="x" onerror="alert(1)"`. Usar `esc(title)` en `ProductCard.js:32` |
| `console.dir` leía `clickedProduct.picked` antes del guard | ✅ Corregido | Eliminado en `85b32cb`; no queda en `ProductService` |
| `console.log` de depuración en `removeFromCart` | ❌ Nuevo | `CartService.js:91`; quitar |
| Query sin codificar | ❌ Abierto | `ApiProductRepository.js:7` concatena crudo. `"iphone 5s & x"` genera `...?q=iphone%205s%20&%20x`. `ProductService.js:40` además usa `query`, no `normalizedQuery` |
| `localStorage` corrupto o no-array | ❌ Abierto | `LocalCartRepository.js:4-10`: `JSON.parse` devuelve `{...}`; `CartController` lanza `Cart must be an array.` y el carrito queda muerto. Validar `Array.isArray` y devolver `[]` en el catch |
| `width`/`height` de imagen | ❌ Abierto | `ProductCard.js:3-4,33-34`: `heigth` mal escrito y `dimensions` es el tamaño físico del producto. Verificado `width="undefined" height="undefined"`. Quitar ambos atributos; el CSS ya reserva `height: 6rem` |
| `HttpClient` imprime `response.text` | ❌ Abierto | `HttpClient.js:16`: `${response.text}` inserta el código de la función, no `statusText`. Usar `response.statusText` |
| `aria-pressed` estático en producto | ❌ Abierto | `ProductCard.js:53`; `ProductView` no lo actualiza. El botón es “Add +”, no un toggle. Quitarlo |
| Test de error de `HttpClient` débil | ❌ Abierto | `HttpClient.test.js:42-52`: pasa si no se lanza nada y solo comprueba el prefijo; no detecta el bug de `response.text` |

Arreglo probado para el test de `HttpClient`:

```js
let message = '';
try {
    await silenced(() => HttpClient({ url: fakeUrl, fetch: fakeFetch }));
} catch (error) {
    message = error.message;
}
expect(message.includes('Status: 500 - Server error')).toBe(true);
```

---

## 5. Tests: estado y carencias

- Pasan los 13 actuales.
- El test de error de `HttpClient` no falla si el cliente deja de lanzar. Corregirlo.
- Faltan, por orden de rentabilidad:
  1. `ProductService` con repo falso: secuencia `IDLE → LOADING → SUCCESS`, `EMPTY`, `ERROR`, carrera de respuestas, vaciar input con petición en vuelo, `setPickedIds` + búsqueda.
  2. `mapProductToCartItem` / `toCartLine` y `addToCart` con datos planos.
  3. `LocalCartRepository` con storage inyectado: JSON corrupto, objeto, `null`.
  4. Cableado (`connectProductsToCart`, `connectCartToCheckout`, handlers de compra) con servicios falsos.
  5. Re-entrada de `createSignal`.
  6. Escape del `alt` de `ProductCard`.

---

## 6. Plan por fases

### Fase 0 — bugs sueltos (bajo riesgo, commits independientes)

1. `HttpClient`: `response.statusText`; test corregido.
2. `LocalCartRepository({ key, storage })`: storage inyectable, `Array.isArray`, `return []` en catch; tests.
3. Query: `ProductService` pasa `normalizedQuery`; `ApiProductRepository` hace `encodeURIComponent(query)`; test con `iphone 5s & x`.
4. `ProductCard`: `esc(title)` en `alt`, quitar `width`/`height`/`dimensions`, quitar `aria-pressed`.
5. Quitar `console.log` de `CartService` y `cartItems` sin uso.
6. `createSignal`: notificar con valor vivo, guarda de re-entrada, test.

### Fase 1 — una sola fuente de verdad

1. Quitar `onRemoveItemIntent` de `CartController` y `CartModule`.
2. Quitar `lastPickedProductSignal`, `onProductPicked` y `pickProductQuantity` de `ProductService`.
3. Quitar el input de cantidad de `ProductCard` y agregar siempre `1` (recomendado, alineado con el README).
4. `setPickedIds(ids)` emite un signal; `ProductController` actualiza solo las tarjetas visibles.
5. Borrar el mapper de `shared`; crear `src/composition/toCartLine.js`.
6. `CartService.addToCart` recibe datos planos y construye `CartItem`; actualizar tests (evitar doble escalado).

### Fase 2 — composición

1. Crear `src/composition/`: `connectProductsToCart`, `connectCartToCheckout`, `createCheckoutHandlers`, `toCartLine`.
2. `main.js`: solo DOM, módulos y llamadas. Sin closures de flujo ni referencias adelantadas.
3. Tests de cableado con fakes: ids sin `isDisabled`, payload al checkout, compra limpia carrito y productos una sola vez.

### Fase 3 — higiene del dominio (requiere decisión)

1. Borrado real vs. lógico. Si es real, simplificar `CartItem`, `Order`, `CartCalculations`, `CartController` y tests.
2. Mover `CartItemNumbersToRender` y `correctCartTotalsForDisplay` a UI o a un formateador compartido.
3. Una sola constante de escala monetaria.
4. Sacar `picked` y `dimensions` de `Product`; `picked` se calcula en aplicación para la UI.

### Fase 4 — tests restantes

Los de la sección 5.

---

## 7. Decisiones pendientes

1. **Filas eliminadas del carrito**: borrado real (más cercano al README: “decreasing a line with quantity 1 removes it”) o mantener el borrado lógico actual.
2. **Campo de cantidad en la tarjeta de producto**: quitarlo (recomendado; el README lo excluye) o conservarlo pasando la cantidad explícita por el intent.
3. **Alcance de UI del carrito**: el README pide imagen (`thumbnail`), título y controles de aumentar/disminuir; hoy solo hay eliminar y no se muestra imagen. Confirmar si entra en el alcance.

---

## 8. Gaps fuera de la revisión original

- La línea del carrito no muestra `thumbnail` ni solo el `title`; muestra `title - brand category`.
- No existen controles de aumentar/disminuir cantidad; solo eliminar.
- El README dice explícitamente que el campo de cantidad en la tarjeta de producto no forma parte del ejercicio, pero está implementado.
- `ProductCard` asume que `dimensions` existe (`ProductCard.js:4`). En la app no rompe porque `Product` le da `{}` por defecto, pero si se renderiza un producto crudo, lanza. Además, una excepción de render dentro de un listener de `productSignal.set` es capturada por el `catch` de `ProductService.search` y se reporta como estado `ERROR`, confundiendo un fallo de UI con un fallo de API.

---

## 9. Notas para el siguiente agente

- No des por cierta toda la revisión original: el estado cambió con `0ddc463`. Verificar contra el código y, cuando sea barato, contra el navegador.
- El rebote está condicionado a que el producto quitado siga en los resultados actuales; probar ambos casos.
- Ejecutar `node src/shared/test/index.js` después de cada cambio.
- Mantener `product`, `cart` y `checkout` sin imports entre sí; la composición va en `src/composition/` o `main.js`.
- Al cambiar la firma de `addToCart`, revisar el escalado de precios en los tests.
- Actualizar este archivo cuando se cierren fases o cambien decisiones.
