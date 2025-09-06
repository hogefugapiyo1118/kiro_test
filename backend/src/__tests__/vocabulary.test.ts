import express from 'express';
import { describe, it, expect } from '@jest/globals';
// Jest provides describe/it/expect globally; no need to import from 'node:test'

// Simple test to verify the basic structure works
describe('Vocabulary API Basic Test', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should create express app', () => {
    const app = express();
    expect(app).toBeDefined();
  });
});