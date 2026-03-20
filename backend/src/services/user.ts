import prisma from '../models';
import bcrypt from 'bcrypt';
import { User } from '@prisma/client';

const SALT_ROUNDS = 10;

export class UserService {
  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        status: true,
        createdAt: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        status: true,
        createdAt: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async create(data: { username: string; password: string; email?: string }) {
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    return prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        email: data.email,
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, data: { email?: string; avatar?: string; status?: number }) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }

  async updatePassword(id: string, oldPassword: string, newPassword: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return false;
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      return false;
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return true;
  }

  async assignRoles(userId: string, roleIds: string[]) {
    // 删除现有角色关联
    await prisma.userRole.deleteMany({
      where: { userId },
    });

    // 创建新的角色关联
    if (roleIds.length > 0) {
      await prisma.userRole.createMany({
        data: roleIds.map((roleId) => ({
          userId,
          roleId,
        })),
      });
    }

    return this.findById(userId);
  }
}

export const userService = new UserService();
