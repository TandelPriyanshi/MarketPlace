import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import authService from '../services/auth.service';
import { logger } from '../utils/logger';

class AuthController {
  async register(req: Request, res: Response) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name, phone, role } = req.body;
      
      // Register user
      const result = await authService.registerUser(
        email, 
        password, 
        name, 
        phone, 
        role
      );

      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Registration error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Registration failed'
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      
      // Login user
      const result = await authService.loginUser(email, password);

      return res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Login error:', error);
      return res.status(401).json({
        success: false,
        message: error.message || 'Invalid credentials'
      });
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      // User is already attached to request by auth middleware
      const user = req.user;
      
      return res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Get current user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get current user'
      });
    }
  }
}

export default new AuthController();
