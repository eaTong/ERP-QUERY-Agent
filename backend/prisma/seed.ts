import bcrypt from 'bcrypt';
import prisma from '../src/models';

const SALT_ROUNDS = 10;

async function main() {
  // 创建管理员用户
  const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      email: 'admin@example.com',
      status: 1,
    },
  });

  console.log('Created admin user:', admin.username);

  // 创建默认角色
  const adminRole = await prisma.role.upsert({
    where: { code: 'admin' },
    update: {},
    create: {
      name: '管理员',
      code: 'admin',
      description: '系统管理员',
      status: 1,
    },
  });

  console.log('Created admin role:', adminRole.name);

  // 创建普通用户角色
  const userRole = await prisma.role.upsert({
    where: { code: 'user' },
    update: {},
    create: {
      name: '普通用户',
      code: 'user',
      description: '普通用户角色',
      status: 1,
    },
  });

  console.log('Created user role:', userRole.name);

  // 给管理员分配角色
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: adminRole.id,
    },
  });

  console.log('Assigned admin role to admin user');

  // 创建默认菜单
  const menusData = [
    { name: '首页', path: '/dashboard', icon: 'Dashboard', sort: 1 },
    { name: '权限管理', path: '/admin', icon: 'AdminPanel', sort: 2 },
    { name: '用户管理', path: '/admin/users', icon: 'People', sort: 21 },
    { name: '角色管理', path: '/admin/roles', icon: 'Security', sort: 22 },
    { name: '菜单管理', path: '/admin/menus', icon: 'Menu', sort: 23 },
    { name: '数据源', path: '/datasource', icon: 'Storage', sort: 3 },
    { name: '外部数据源', path: '/datasource/list', icon: 'Hub', sort: 31 },
    { name: '表映射', path: '/datasource/mappings', icon: 'Table', sort: 32 },
    { name: '提示词规则', path: '/datasource/prompts', icon: 'Rule', sort: 33 },
    { name: 'AI 查询', path: '/query', icon: 'Search', sort: 4 },
    { name: '查询历史', path: '/history', icon: 'History', sort: 5 },
  ];

  for (const menu of menusData) {
    const existing = await prisma.menu.findFirst({
      where: { path: menu.path },
    });

    if (!existing) {
      await prisma.menu.create({
        data: {
          name: menu.name,
          path: menu.path,
          icon: menu.icon || '',
          sort: menu.sort,
          status: 1,
        },
      });
    }
  }

  console.log('Created default menus');

  // 给管理员角色分配所有菜单
  const allMenus = await prisma.menu.findMany();
  for (const menu of allMenus) {
    const existing = await prisma.roleMenu.findFirst({
      where: {
        roleId: adminRole.id,
        menuId: menu.id,
      },
    });

    if (!existing) {
      await prisma.roleMenu.create({
        data: {
          roleId: adminRole.id,
          menuId: menu.id,
        },
      });
    }
  }

  console.log('Assigned all menus to admin role');

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
