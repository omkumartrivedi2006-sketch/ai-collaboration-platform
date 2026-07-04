import prisma from '../config/db';
import { AppError } from '../utils/AppError';

export class ProfileService {
  async updateProfile(userId: string, data: any) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone,
        avatar: data.avatar,
        designation: data.designation,
        bio: data.bio || null,
        website: data.website || null,
        location: data.location || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        designation: true,
        bio: true,
        website: true,
        location: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }
}
