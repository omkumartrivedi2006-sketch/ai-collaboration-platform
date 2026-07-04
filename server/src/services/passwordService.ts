import prisma from '../config/db';
import { AppError } from '../utils/AppError';
import bcrypt from 'bcrypt';

export class PasswordService {
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Minimum password policy check
    if (newPassword.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400);
    }

    // Hash and save
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return { success: true };
  }
}
