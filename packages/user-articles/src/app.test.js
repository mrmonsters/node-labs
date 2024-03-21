import { afterEach, describe, expect, jest, test } from '@jest/globals';
import request from 'supertest';
import app from './app';
import UserRepository from './repositories/UserRepository';
import UserSessionRepository from './repositories/UserSessionRepository';

afterEach(() => {
  jest.clearAllMocks();
});

describe('API', () => {
  test('POST /api/user should return 201 after adding new user record', () => {
    const payload = {
      user_id: '10001',
      login: 'username@example.org',
      password: 'abc*123!',
    };
    const mockCreate = jest.spyOn(UserRepository.prototype, 'create');

    return request(app)
      .post('/api/user')
      .send(payload)
      .then((response) => {
        expect(mockCreate).toHaveBeenCalledWith(payload);
        expect(response.statusCode).toEqual(201);
      });
  });

  test('POST /api/user should return 400 if body is empty', () => {
    const mockCreate = jest.spyOn(UserRepository.prototype, 'create');

    return request(app)
      .post('/api/user')
      .then((response) => {
        expect(mockCreate).toHaveBeenCalledTimes(0);
        expect(response.statusCode).toEqual(400);
      });
  });

  test('POST /api/authenticate should return token if user exists', () => {
    const user = { user_id: '10001', login: 'username@example.org', password: 'abc*123!' };
    const mockGetUserByLogin = jest.spyOn(UserRepository.prototype, 'getUserByLogin');

    mockGetUserByLogin.mockReturnValue(user);

    return request(app)
      .post('/api/authenticate')
      .send({ login: user.login, password: user.password })
      .then((response) => {
        expect(mockGetUserByLogin).toHaveBeenCalledWith(user.login);
        expect(response.statusCode).toEqual(200);
        expect(response.body.token).toBeDefined();
      });
  });

  test('POST /api/authenticate should return 400 if body is empty', () => {
    const mockGetUserByLogin = jest.spyOn(UserRepository.prototype, 'getUserByLogin');

    return request(app)
      .post('/api/authenticate')
      .then((response) => {
        expect(mockGetUserByLogin).toHaveBeenCalledTimes(0);
        expect(response.statusCode).toEqual(400);
      });
  });

  test('POST /api/authenticate should return 401 if password is incorrect', () => {
    const user = { user_id: '10001', login: 'username@example.org', password: 'abc*123!' };
    const mockGetUserByLogin = jest.spyOn(UserRepository.prototype, 'getUserByLogin');

    mockGetUserByLogin.mockReturnValue(user);

    return request(app)
      .post('/api/authenticate')
      .send({ login: user.login, password: 'def*456!' })
      .then((response) => {
        expect(mockGetUserByLogin).toHaveBeenCalledWith(user.login);
        expect(response.statusCode).toEqual(401);
      });
  });

  test('POST /api/logout should return 200 if logout successfully', () => {
    const mockGetUserSessionByToken = jest.spyOn(UserSessionRepository.prototype, 'getUserSessionByToken');
    const mockDeleteUserSessionByToken = jest.spyOn(UserSessionRepository.prototype, 'deleteUserSessionByToken');

    mockGetUserSessionByToken.mockReturnValue({ user_id: '10001', token: 'sometoken' });

    return request(app)
      .post('/api/logout')
      .set('authentication-header', 'sometoken')
      .then((response) => {
        expect(mockGetUserSessionByToken).toHaveBeenCalledWith('sometoken');
        expect(mockDeleteUserSessionByToken).toHaveBeenCalledWith('sometoken');
        expect(response.statusCode).toEqual(200);
      });
  });

  test('POST /api/logout should return 401 if authentication-header header is not set', () => {
    const mockGetUserSessionByToken = jest.spyOn(UserSessionRepository.prototype, 'getUserSessionByToken');

    return request(app)
      .post('/api/logout')
      .then((response) => {
        expect(mockGetUserSessionByToken).toHaveBeenCalledTimes(0);
        expect(response.statusCode).toEqual(401);
      });
  });

  test('POST /api/logout should return 401 for non-existent token', () => {
    const mockGetUserSessionByToken = jest.spyOn(UserSessionRepository.prototype, 'getUserSessionByToken');

    mockGetUserSessionByToken.mockReturnValue(undefined);

    return request(app)
      .post('/api/logout')
      .set('authentication-header', 'sometoken')
      .then((response) => {
        expect(mockGetUserSessionByToken).toHaveBeenCalledWith('sometoken');
        expect(response.statusCode).toEqual(401);
      });
  });
});
