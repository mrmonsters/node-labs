import { CreateUserInput, User } from '../../types/user';

export default class UserRepository {
  private records: Array<User>;

  constructor() {
    this.records = [];
  }

  public create(input: CreateUserInput): void {
    this.records.push({
      user_id: input.user_id,
      login: input.login,
      password: input.password,
    });
  }

  public getUserByLogin(login: string): User | undefined {
    return this.records.find((record) => record.login === login);
  }
}
