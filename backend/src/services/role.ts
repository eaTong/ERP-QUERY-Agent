import prisma from '../models';

export class RoleService {
  async findAll() {
    return prisma.role.findMany({
      include: {
        menus: {
          include: {
            menu: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.role.findUnique({
      where: { id },
      include: {
        menus: {
          include: {
            menu: true,
          },
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async create(data: { name: string; code: string; description?: string }) {
    return prisma.role.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
      },
    });
  }

  async update(id: string, data: { name?: string; code?: string; description?: string; status?: number }) {
    return prisma.role.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.role.delete({
      where: { id },
    });
  }

  async assignMenus(roleId: string, menuIds: string[]) {
    // 删除现有菜单关联
    await prisma.roleMenu.deleteMany({
      where: { roleId },
    });

    // 创建新的菜单关联
    if (menuIds.length > 0) {
      await prisma.roleMenu.createMany({
        data: menuIds.map((menuId) => ({
          roleId,
          menuId,
        })),
      });
    }

    return this.findById(roleId);
  }
}

export const roleService = new RoleService();
