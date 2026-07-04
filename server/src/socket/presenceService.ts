import prisma from '../config/db';

class PresenceService {
  private activeUsers = new Map<string, Set<string>>();

  async handleConnect(userId: string, socketId: string): Promise<boolean> {
    let sockets = this.activeUsers.get(userId);
    const isNewConnection = !sockets || sockets.size === 0;

    if (!sockets) {
      sockets = new Set();
      this.activeUsers.set(userId, sockets);
    }
    sockets.add(socketId);

    if (isNewConnection) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { isOnline: true }
        });
      } catch (err) {
        console.error(`Failed to update online presence for user ${userId}:`, err);
      }
    }

    return isNewConnection;
  }

  async handleDisconnect(userId: string, socketId: string): Promise<boolean> {
    const sockets = this.activeUsers.get(userId);
    if (!sockets) return false;

    sockets.delete(socketId);
    const isOfflineNow = sockets.size === 0;

    if (isOfflineNow) {
      this.activeUsers.delete(userId);
      try {
        await prisma.user.update({
          where: { id: userId },
          data: {
            isOnline: false,
            lastSeen: new Date()
          }
        });
      } catch (err) {
        console.error(`Failed to update offline presence for user ${userId}:`, err);
      }
    }

    return isOfflineNow;
  }

  isUserOnline(userId: string): boolean {
    const sockets = this.activeUsers.get(userId);
    return !!sockets && sockets.size > 0;
  }

  getOnlineUsers(): string[] {
    return Array.from(this.activeUsers.keys());
  }
}

export const presenceService = new PresenceService();
export default presenceService;
