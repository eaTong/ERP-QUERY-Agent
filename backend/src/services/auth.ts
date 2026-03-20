import bcrypt from 'bcrypt';
import prisma from '../models';
import { User } from '@prisma/client';

const SALT_ROUNDS = 10;

export class AuthService {
  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }

    return user;
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async createUser(username: string, password: string, email?: string): Promise<User> {
    const hashedPassword = await this.hashPassword(password);

    return prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
      },
    });
  }

  async getUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return false;
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      return false;
    }

    const hashedPassword = await this.hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return true;
  }

  async getUserMenus(userId: string) {
    // 获取用户的所有菜单（根据用户角色）
    const userWithRoles = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                menus: {
                  include: {
                    menu: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userWithRoles) {
      return [];
    }

    // 收集所有有权限的菜单 ID
    const menuMap = new Map<string, any>();
    userWithRoles.roles.forEach((ur) => {
      ur.role.menus.forEach((rm) => {
        if (rm.menu.status === 1) {
          // 只添加启用的菜单
          menuMap.set(rm.menu.id, rm.menu);
        }
      });
    });

    // 构建树形结构
    const menus = Array.from(menuMap.values());
    return this.buildMenuTree(menus);
  }

  private buildMenuTree(menus: any[]) {
    const menuMap = new Map();
    const rootMenus: any[] = [];

    menus.forEach((menu) => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    menus.forEach((menu) => {
      const menuNode = menuMap.get(menu.id);
      if (menu.parentId && menuMap.has(menu.parentId)) {
        menuMap.get(menu.parentId).children.push(menuNode);
      } else {
        rootMenus.push(menuNode);
      }
    });

    // 按 sort 排序
    const sortMenus = (items: any[]): any[] => {
      items.sort((a, b) => a.sort - b.sort);
      items.forEach((item) => {
        if (item.children.length > 0) {
          sortMenus(item.children);
        }
      });
      return items;
    };

    return sortMenus(rootMenus);
  }
}

export const authService = new AuthService();
