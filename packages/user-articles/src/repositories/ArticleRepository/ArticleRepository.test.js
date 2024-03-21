import { beforeAll, describe, expect, test } from '@jest/globals';
import ArticleRepository from './ArticleRepository';
import { Visibility } from '../../types/article';

const userSessionA = { user_id: '10001', token: 'secret' };
const userSessionB = { user_id: '10002', token: 'secret' };
const articleRepository = new ArticleRepository();

beforeAll(() => {
  const fixtures = [
    {
      input: {
        article_id: '10001',
        title: 'Article #1',
        content: 'Article #1 content',
        visibility: Visibility.PUBLIC,
      },
      userSession: userSessionA,
    },
    {
      input: {
        article_id: '10002',
        title: 'Article #2',
        content: 'Article #2 content',
        visibility: Visibility.LOGGED_IN,
      },
      userSession: userSessionA,
    },
    {
      input: {
        article_id: '10003',
        title: 'Article #3',
        content: 'Article #3 content',
        visibility: Visibility.PRIVATE,
      },
      userSession: userSessionA,
    },
    {
      input: {
        article_id: '10004',
        title: 'Article #4',
        content: 'Article #4 content',
        visibility: Visibility.PUBLIC,
      },
      userSession: userSessionB,
    },
    {
      input: {
        article_id: '10005',
        title: 'Article #5',
        content: 'Article #5 content',
        visibility: Visibility.LOGGED_IN,
      },
      userSession: userSessionB,
    },
    {
      input: {
        article_id: '10006',
        title: 'Article #6',
        content: 'Article #6 content',
        visibility: Visibility.PRIVATE,
      },
      userSession: userSessionB,
    },
  ];

  fixtures.forEach(({ input, userSession }) => {
    articleRepository.create(input, userSession);
  });
});

describe('ArticleRepository', () => {
  test('create should add a new item to record', () => {
    articleRepository.create(
      {
        article_id: '10007',
        title: 'Article #7',
        content: 'Article #7 content',
        visibility: Visibility.PRIVATE,
      },
      userSessionB,
    );

    expect(articleRepository['records'].length).toEqual(7);
  });

  test('getPublicArticles should return articles with PUBLIC type visibility', () => {
    const articles = articleRepository.getPublicArticles();

    expect(articles.length).toEqual(2);
    expect(articles).toEqual(
      expect.arrayContaining([
        {
          article_id: '10001',
          title: 'Article #1',
          content: 'Article #1 content',
          visibility: Visibility.PUBLIC,
          user_id: '10001',
        },
        {
          article_id: '10004',
          title: 'Article #4',
          content: 'Article #4 content',
          visibility: Visibility.PUBLIC,
          user_id: '10002',
        },
      ]),
    );
  });

  test('getUserArticles should return all user accessible articles', () => {
    const articles = articleRepository.getUserArticles(userSessionA.user_id);

    expect(articles.length).toEqual(5);
    expect(articles).toEqual(
      expect.arrayContaining([
        {
          article_id: '10001',
          title: 'Article #1',
          content: 'Article #1 content',
          visibility: Visibility.PUBLIC,
          user_id: userSessionA.user_id,
        },
        {
          article_id: '10002',
          title: 'Article #2',
          content: 'Article #2 content',
          visibility: Visibility.LOGGED_IN,
          user_id: userSessionA.user_id,
        },
        {
          article_id: '10003',
          title: 'Article #3',
          content: 'Article #3 content',
          visibility: Visibility.PRIVATE,
          user_id: userSessionA.user_id,
        },
        {
          article_id: '10004',
          title: 'Article #4',
          content: 'Article #4 content',
          visibility: Visibility.PUBLIC,
          user_id: userSessionB.user_id,
        },
        {
          article_id: '10005',
          title: 'Article #5',
          content: 'Article #5 content',
          visibility: Visibility.LOGGED_IN,
          user_id: userSessionB.user_id,
        },
      ]),
    );
  });
});
