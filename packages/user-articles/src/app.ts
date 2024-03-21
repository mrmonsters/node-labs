'use strict';

import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import express, { NextFunction } from 'express';
import { Request, Response } from 'express';
import UserRepository from './repositories/UserRepository';
import UserSessionRepository from './repositories/UserSessionRepository';
import ArticleRepository from './repositories/ArticleRepository';
import { HEADER_AUTH } from './utils/constants';
import { CreateUserInput, LoginInput, User } from './types/user';
import { CreateArticleInput } from './types/article';
import { UserSession } from './types/userSession';

const app = express();
app.use(express.json());

// Your code starts here.
// Placeholders for all requests are provided for your convenience.

const userRepository = new UserRepository();
const userSessionRepository = new UserSessionRepository();
const articleRepository = new ArticleRepository();

/** middlewares */

const checkReqBody = (req: Request, res: Response, next: NextFunction) => {
  if (_.isEmpty(req.body)) {
    res.status(400).end();
    return;
  }

  next();
};

const checkSessionToken = (req: Request, res: Response, next: NextFunction) => {
  const unauthorised = () => {
    res.status(401).end();
    return;
  };

  const authToken = req.get(HEADER_AUTH);

  if (!authToken) {
    return unauthorised();
  }

  const token = userSessionRepository.getUserSessionByToken(authToken);

  if (!token) {
    return unauthorised();
  }

  next();
};

app.post('/api/user', [checkReqBody], (req: Request, res: Response) => {
  const { user_id, login, password } = req.body as CreateUserInput;

  userRepository.create({ user_id, login, password });

  res.status(201).end();
});

app.post('/api/authenticate', [checkReqBody], (req: Request, res: Response) => {
  const { login, password } = req.body as LoginInput;
  const user = userRepository.getUserByLogin(login);

  if (!user) {
    res.status(404).end();
    return;
  }

  if ((user as User).password !== password) {
    res.status(401).end();
    return;
  }

  const token = uuidv4();

  userSessionRepository.create({ user_id: (user as User).user_id, token });

  res.status(200).json({ token });
});

app.post('/api/logout', [checkSessionToken], (req: Request, res: Response) => {
  userSessionRepository.deleteUserSessionByToken(req.get(HEADER_AUTH) as string);

  res.status(200).end();
});

app.post('/api/articles', [checkReqBody, checkSessionToken], (req: Request, res: Response) => {
  const { article_id, title, content, visibility } = req.body as CreateArticleInput;
  const userSession = userSessionRepository.getUserSessionByToken(req.get(HEADER_AUTH) as string) as UserSession;

  articleRepository.create({ article_id, title, content, visibility }, userSession);

  res.status(201).end();
});

app.get('/api/articles', (req: Request, res: Response) => {
  const authToken = req.get(HEADER_AUTH);

  if (!authToken || !userSessionRepository.getUserSessionByToken(authToken)) {
    res.status(200).json(articleRepository.getPublicArticles());
    return;
  }

  const userSession = userSessionRepository.getUserSessionByToken(authToken) as UserSession;

  res.status(200).json(articleRepository.getUserArticles(userSession.user_id));
});

export default app;
