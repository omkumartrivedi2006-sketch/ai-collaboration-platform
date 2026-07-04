import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { UserService } from '../services/userService';
import { logUserAction } from '../middleware/auditMiddleware';

const authService = new AuthService();
const userService = new UserService();

const getCookieOptions = () => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  };
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, token } = await authService.register(req.body);

    res.cookie('token', token, getCookieOptions());

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          department: user.department,
          designation: user.designation,
          phone: user.phone,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);

    // Audit Log Login
    await logUserAction(user.id, 'Login', 'User', user.id, null, null, req);

    res.cookie('token', token, getCookieOptions());

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          department: user.department,
          designation: user.designation,
          phone: user.phone,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user) {
      await logUserAction(req.user.id, 'Logout', 'User', req.user.id, null, null, req);
    }

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }

    const user = await userService.getUserById(req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          department: user.department,
          designation: user.designation,
          phone: user.phone,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }

    const updatedUser = await userService.updateProfile(req.user.id, req.body);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          avatar: updatedUser.avatar,
          department: updatedUser.department,
          designation: updatedUser.designation,
          phone: updatedUser.phone,
          isActive: updatedUser.isActive,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.getActiveUsers();
    res.status(200).json({
      status: 'success',
      data: {
        users: users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          department: user.department,
          designation: user.designation
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

