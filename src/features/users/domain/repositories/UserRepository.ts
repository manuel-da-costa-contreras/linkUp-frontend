import type { User } from "../entities/User";

export interface UserRepository {
  findAll(): Promise<User[]>;
  findById(userId: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
