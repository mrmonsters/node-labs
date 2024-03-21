import { beforeAll, describe, expect, test } from '@jest/globals';
import UserSessionRepository from './UserSessionRepository';

beforeAll(() => {
  const fixtures = [
    {
      user_id: '10001',
      token: 'abc*123!',
    },
    {
      user_id: '10002',
      token: 'def*123!',
    },
  ];

  fixtures.forEach((item) => {
    userSessionRepository.create(item);
  });
});

const userSessionRepository = new UserSessionRepository();

describe('UserSessionRepository', () => {
  test('create should add new item to record', () => {
    userSessionRepository.create({ token: 'xyz*123!', user_id: '10003' });

    expect(userSessionRepository['records'].length).toEqual(3);
  });

  test('getUserSessionByToken should return session of matching token', () => {
    const userSession = userSessionRepository.getUserSessionByToken('abc*123!');

    expect(userSession).toBeDefined();
    expect(userSession.user_id).toBe('10001');
  });

  test('getUserSessionByToken should return undefined for non-matching token', () => {
    const userSession = userSessionRepository.getUserSessionByToken('jkl*123!');

    expect(userSession).toBeUndefined();
  });

  test('deleteUserSessionByToken should remove session of matching token', () => {
    userSessionRepository.deleteUserSessionByToken('abc*123!');

    expect(userSessionRepository['records'].length).toEqual(2);
  });
});
