import { describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';
import fs from 'fs';
import { app, initUploadDir } from '../src/app';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  // only mock methods that are used in the test
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

describe('Upload Directory Initialization', () => {
  it('should create the upload directory if it does not exist', async () => {
    // mock the return value of fs.existsSync
    const mockFsExistsSync = jest.mocked(fs.existsSync);
    mockFsExistsSync.mockReturnValue(false);

    const mockFsMkdirSync = jest.mocked(fs.mkdirSync);

    let testPath = './test-path';
    initUploadDir(testPath);

    expect(mockFsExistsSync).toBeCalledWith(testPath);
    expect(mockFsMkdirSync).toBeCalledWith(testPath, { recursive: true });
  });

  it('should not create the upload directory if it already exists', async () => {
    // mock the return value of fs.existsSync
    const mockFsExistsSync = jest.mocked(fs.existsSync);
    mockFsExistsSync.mockReturnValue(true);

    const mockFsMkdirSync = jest.mocked(fs.mkdirSync);

    let testPath = './test-path';
    initUploadDir(testPath);

    expect(mockFsExistsSync).toBeCalledWith(testPath);
    expect(mockFsMkdirSync).not.toBeCalled();
  });
});

describe('GET /', () => {
  it('Check OK', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });
});
