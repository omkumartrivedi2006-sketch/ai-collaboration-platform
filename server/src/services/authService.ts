import { UserRepository } from '../repositories/userRepository';
import { AppError } from '../utils/AppError';
import { signToken } from '../utils/jwt';
import bcrypt from 'bcrypt';
import { User, Role } from '@prisma/client';
import prisma from '../config/db';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: any): Promise<{ user: User; token: string }> {
    let assignedRole = data.role as Role || Role.Employee;
    let assignedDeptId: string | null = data.departmentId || null;
    let email = data.email;

    if (data.invitationToken) {
      const invitation = await prisma.invitation.findUnique({
        where: { token: data.invitationToken }
      });
      if (!invitation || invitation.status !== 'PENDING' || new Date() > invitation.expiresAt) {
        throw new AppError('Invalid or expired invitation token', 400);
      }
      email = invitation.email;
      assignedRole = invitation.role;
      assignedDeptId = invitation.departmentId;
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await this.userRepository.create({
      name: data.name,
      email,
      password: hashedPassword,
      role: assignedRole,
      phone: data.phone,
      memberDepartment: assignedDeptId ? { connect: { id: assignedDeptId } } : undefined,
      designation: data.designation,
      avatar: data.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(data.name)}`,
    });

    if (data.invitationToken) {
      await prisma.invitation.update({
        where: { token: data.invitationToken },
        data: { status: 'ACCEPTED' }
      });
    }

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
