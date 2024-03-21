import { CreateUserSessionInput, UserSession } from '../../types/userSession';

export default class UserSessionRepository {
  private records: Array<UserSession>;

  constructor() {
    this.records = [];
  }

  public create(input: CreateUserSessionInput): void {
    this.records.push({
      token: input.token,
      user_id: input.user_id,
    });
  }

  public getUserSessionByToken(token: string): UserSession | undefined {
    return this.records.find((record) => record.token === token);
  }

  public deleteUserSessionByToken(token: string): void {
    const index = this.records.findIndex((record) => record.token === token);

    this.records.splice(index, 1);
  }
}
