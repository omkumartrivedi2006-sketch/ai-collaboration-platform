import { Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';

export interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    role: string;
  };
}

export const socketAuthMiddleware = (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication error: Token not provided'));
    }

    const decoded = verifyToken(token);
    socket.user = {
      id: decoded.id,
      role: decoded.role
    };
    next();
  } catch (error) {
    return next(new Error('Authentication error: Invalid or expired token'));
  }
};
