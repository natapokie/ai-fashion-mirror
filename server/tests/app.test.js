import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';

describe('GET /', () => {
  it('Check OK', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });
});
