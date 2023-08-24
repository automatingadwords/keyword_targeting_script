// sum.test.js
import {expect, test} from 'vitest';
import {isNegativeKeyword} from '../script/is_negative_keyword.js';
import {getTargetingToolOutputData} from '../script/get_output_data.js';

const targetingToolOutputData = getTargetingToolOutputData();

console.log(`targetingToolOutputData: ${targetingToolOutputData}`);

test('water spouts is negative', () => {
  const searchTerm = 'water spouts';
  expect(isNegativeKeyword(searchTerm, targetingToolOutputData)).toBe(true);
});
test('water pool spout is negative', () => {
  const searchTerm = 'water pool spout';
  expect(isNegativeKeyword(searchTerm, targetingToolOutputData)).toBe(false);
});
test('water lake spout is negative', () => {
  const searchTerm = 'water lake spout';
  expect(isNegativeKeyword(searchTerm, targetingToolOutputData)).toBe(false);
});
test('water spout for pool is negative', () => {
  const searchTerm = 'water spout for pool';
  expect(isNegativeKeyword(searchTerm, targetingToolOutputData)).toBe(false);
});
test('modern pool water spout is negative', () => {
  const searchTerm = 'modern pool water spout';
  expect(isNegativeKeyword(searchTerm, targetingToolOutputData)).toBe(false);
});
test('buy water spout is negative', () => {
  const searchTerm = 'buy water spout';
  expect(isNegativeKeyword(searchTerm, targetingToolOutputData)).toBe(false);
});

test('pool spout for sale is negative', () => {
  const searchTerm = 'pool spout for sale';
  expect(isNegativeKeyword(searchTerm, targetingToolOutputData)).toBe(true);
});
test('pool scupper is negative', () => {
  const searchTerm = 'pool scupper';
  expect(isNegativeKeyword(searchTerm, targetingToolOutputData)).toBe(true);
});

test('spout pool water is negative', () => {
  const searchTerm = 'spout pool water';
  expect(isNegativeKeyword(searchTerm, targetingToolOutputData)).toBe(false);
});
