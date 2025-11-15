import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/user.model';
import { logger } from '../utils/logger';
import { env } from '../config/env';

const { JWT_SECRET, JWT_EXPIRES_IN } = env;

class AuthService {
  async registerUser(email: string, password: string, name: string, phone: string, role: UserRole = UserRole.CUSTOMER) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await User.create({
        email,
        passwordHash: hashedPassword,
        name,
        phone,
        role,
        isActive: true
      });

      // Generate JWT token
      const token = this.generateToken(user);
      
      return {
        user: this.getUserWithoutPassword(user),
        token
      };
    } catch (error) {
      logger.error('Error in registerUser:', error);
      throw error;
    }
  }

  async loginUser(email: string, password: string) {
    try {
      // Find user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated. Please contact salesman.');
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        user: this.getUserWithoutPassword(user),
        token
      };
    } catch (error) {
      logger.error('Error in loginUser:', error);
      throw error;
    }
  }

  private generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(
      payload,
      JWT_SECRET,
      { 
        expiresIn: JWT_EXPIRES_IN 
      } as jwt.SignOptions
    );
  }

  private getUserWithoutPassword(user: User) {
    const userJson = user.toJSON();
    delete (userJson as any).passwordHash;
    return userJson;
  }

  async validateToken(token: string) {
    try {
      // First, verify the token and get the payload
      const payload = jwt.verify(token, JWT_SECRET);
      
      // Check if the payload has the expected shape
      if (typeof payload === 'string' || !('id' in payload)) {
        throw new Error('Invalid token payload');
      }

      const userId = (payload as jwt.JwtPayload).id;
      if (!userId) {
        throw new Error('User ID not found in token');
      }

      const user = await User.findByPk(userId);
      
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return user;
    } catch (error) {
      logger.error('Error validating token:', error);
      throw new Error('Invalid or expired token');
    }
  }
}

// Export a singleton instance
export const authService = new AuthService();
export default authService;