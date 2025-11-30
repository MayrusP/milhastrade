import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { generateToken, JwtPayload } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../utils/validation';
import { ErrorCodes } from '../utils/constants';
import { EmailService } from './emailService';

const prisma = new PrismaClient();

export class AuthService {
  private static readonly SALT_ROUNDS = 12;

  static async register(data: RegisterInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error(ErrorCodes.DUPLICATE_EMAIL);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Send welcome email (async, don't wait for it)
    EmailService.sendWelcomeEmail(user.email, user.name).catch(console.error);

    return { user, token };
  }

  static async login(data: LoginInput) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error(ErrorCodes.INVALID_CREDENTIALS);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error(ErrorCodes.INVALID_CREDENTIALS);
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error(ErrorCodes.NOT_FOUND);
    }

    return user;
  }

  static async updateUser(userId: string, data: Partial<RegisterInput>) {
    const updateData: any = { ...data };

    // Hash password if provided
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, this.SALT_ROUNDS);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }
}