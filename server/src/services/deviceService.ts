import prisma from '../config/db';
import { AppError } from '../utils/AppError';

export class DeviceService {
  async getDevices(userId: string) {
    return prisma.trustedDevice.findMany({
      where: { userId },
      orderBy: { lastUsed: 'desc' }
    });
  }

  async trustDevice(userId: string, deviceName: string, fingerprint: string) {
    const existing = await prisma.trustedDevice.findFirst({
      where: { userId, fingerprint }
    });

    if (existing) {
      return prisma.trustedDevice.update({
        where: { id: existing.id },
        data: { lastUsed: new Date() }
      });
    }

    return prisma.trustedDevice.create({
      data: {
        userId,
        deviceName,
        fingerprint,
        lastUsed: new Date()
      }
    });
  }

  async renameDevice(userId: string, deviceId: string, newName: string) {
    const device = await prisma.trustedDevice.findUnique({
      where: { id: deviceId }
    });

    if (!device) {
      throw new AppError('Trusted device record not found', 404);
    }

    if (device.userId !== userId) {
      throw new AppError('Unauthorized to modify this device', 403);
    }

    return prisma.trustedDevice.update({
      where: { id: deviceId },
      data: { deviceName: newName }
    });
  }

  async removeDevice(userId: string, deviceId: string) {
    const device = await prisma.trustedDevice.findUnique({
      where: { id: deviceId }
    });

    if (!device) {
      throw new AppError('Trusted device record not found', 404);
    }

    if (device.userId !== userId) {
      throw new AppError('Unauthorized to remove this device', 403);
    }

    return prisma.trustedDevice.delete({
      where: { id: deviceId }
    });
  }
}
