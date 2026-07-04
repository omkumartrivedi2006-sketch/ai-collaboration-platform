import { Socket } from 'socket.io';

class RoomManager {
  joinUserRoom(socket: Socket, userId: string) {
    socket.join(`user:${userId}`);
  }

  joinProjectRoom(socket: Socket, projectId: string) {
    socket.join(`project:${projectId}`);
  }

  joinConversationRoom(socket: Socket, conversationId: string) {
    socket.join(`conversation:${conversationId}`);
  }

  leaveConversationRoom(socket: Socket, conversationId: string) {
    socket.leave(`conversation:${conversationId}`);
  }
}

export const roomManager = new RoomManager();
export default roomManager;
