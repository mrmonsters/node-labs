import { Article, CreateArticleInput, Visibility } from '../../types/article';
import { UserSession } from '../../types/userSession';

export default class ArticleRepository {
  private records: Array<Article>;

  constructor() {
    this.records = [];
  }

  public create(input: CreateArticleInput, userSession: UserSession): void {
    this.records.push({
      article_id: input.article_id,
      title: input.title,
      content: input.content,
      visibility: input.visibility,
      user_id: userSession.user_id,
    });
  }

  public getPublicArticles(): Array<Article> {
    return this.records.filter((record) => record.visibility === Visibility.PUBLIC);
  }

  public getUserArticles(userId: string): Array<Article> {
    return this.records.filter(
      (record) =>
        record.visibility === Visibility.PUBLIC ||
        record.visibility === Visibility.LOGGED_IN ||
        (record.visibility === Visibility.PRIVATE && record.user_id === userId),
    );
  }
}
