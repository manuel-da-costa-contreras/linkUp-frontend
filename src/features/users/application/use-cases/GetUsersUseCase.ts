import type { User } from "@features/users/domain/entities/User";
import type { UserRepository } from "@features/users/domain/repositories/UserRepository";

export class GetUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}


