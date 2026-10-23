import test from 'node:test';
import assert from 'node:assert/strict';
import { orderWeight, formatOrderWeight } from './orderWeight.js';

test('mixed weight units and unit weights produce one total without guessing missing weights', () => {
  const products = [{ id: 1, unit: 'kg' }, { id: 2, unit: 'tonna' }, { id: 3, unit: 'dona', weightKg: 5 }, { id: 4, unit: 'm²' }];
  const items = [{ productId: '1', quantity: 20 }, { productId: '2', quantity: 1.25 }, { productId: '3', quantity: 3 }];
  assert.deepEqual(orderWeight(products, items), { kilograms: 1285, complete: true, missing: 0 });
  assert.equal(orderWeight(products, [...items, { productId: '4', quantity: 2 }]).complete, false);
  assert.equal(orderWeight(products, []).complete, false);
  assert.match(formatOrderWeight(999.5), /kg$/);
  assert.equal(formatOrderWeight(1285), '1,29 t');
  assert.equal(formatOrderWeight(1000), '1,00 t');
});
