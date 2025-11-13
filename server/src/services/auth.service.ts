import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/user.model';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

class AuthService {
  async registerUser(email: string, password: string, name: string, phone: string, role: UserRole = UserRole.BUYER) {
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
        throw new Error('Account is deactivated. Please contact support.');
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

  private generateToken(user: User) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });
  }

  private getUserWithoutPassword(user: User) {
    const userJson = user.toJSON();
    delete userJson.passwordHash;
    return userJson;
  }

  async validateToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await User.findByPk(decoded.id);
      
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

export default new AuthService();
