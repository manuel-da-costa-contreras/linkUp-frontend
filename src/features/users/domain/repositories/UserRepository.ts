import type { User } from "@features/users/domain/entities/User";

export interface UserRepository {
  findAll(): Promise<User[]>;
  findById(userId: string): Promise<User | null>;
  save(user: User): Promise<void>;
}


