import prisma from '../models';

export class MenuService {
  async findAll() {
    return prisma.menu.findMany({
      orderBy: { sort: 'asc' },
    });
  }

  async findById(id: string) {
    return prisma.menu.findUnique({
      where: { id },
    });
  }

  async findTree() {
    const menus = await prisma.menu.findMany({
      orderBy: { sort: 'asc' },
    });

    // 构建树形结构
    const menuMap = new Map();
    const rootMenus: any[] = [];

    menus.forEach((menu) => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    menus.forEach((menu) => {
      const menuNode = menuMap.get(menu.id);
      if (menu.parentId) {
        const parent = menuMap.get(menu.parentId);
        if (parent) {
          parent.children.push(menuNode);
        }
      } else {
        rootMenus.push(menuNode);
      }
    });

    return rootMenus;
  }

  async create(data: { name: string; path: string; icon?: string; parentId?: string; sort?: number }) {
    return prisma.menu.create({
      data: {
        name: data.name,
        path: data.path,
        icon: data.icon || '',
        parentId: data.parentId || null,
        sort: data.sort || 0,
      },
    });
  }

  async update(id: string, data: { name?: string; path?: string; icon?: string; parentId?: string; sort?: number; status?: number }) {
    return prisma.menu.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.menu.delete({
      where: { id },
    });
  }
}

export const menuService = new MenuService();
