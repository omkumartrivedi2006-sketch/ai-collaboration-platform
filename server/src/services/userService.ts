import { UserRepository } from '../repositories/userRepository';
import { User, Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async updateProfile(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    const sanitizedData: Prisma.UserUpdateInput = {
      name: data.name,
      phone: data.phone,
      department: data.department,
      designation: data.designation,
      avatar: data.avatar,
    };

    return this.userRepository.update(id, sanitizedData);
  }

  async getActiveUsers(): Promise<User[]> {
    return this.userRepository.findActiveUsers();
  }
}
