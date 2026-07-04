import { UserRepository } from '../repositories/userRepository';
import { AppError } from '../utils/AppError';
import { signToken } from '../utils/jwt';
import bcrypt from 'bcrypt';
import { User, Role } from '@prisma/client';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: any): Promise<{ user: User; token: string }> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role as Role,
      phone: data.phone,
      department: data.department,
      designation: data.designation,
      avatar: data.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(data.name)}`,
    });

    const token = signToken({ id: newUser.id, role: newUser.role });

    return { user: newUser, token };
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated. Please contact an administrator.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    const updatedUser = await this.userRepository.update(user.id, {
      lastLogin: new Date(),
    });

    const token = signToken({ id: updatedUser.id, role: updatedUser.role });

    return { user: updatedUser, token };
  }
}
