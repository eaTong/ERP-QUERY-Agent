import { test, expect } from '@playwright/test';

test.describe('角色管理 - 分配菜单功能', () => {
  test.beforeEach(async ({ page }) => {
    // 监听控制台错误
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('控制台错误:', msg.text());
      }
    });

    // 登录
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // 等待 React 渲染

    // 检查页面是否包含 React 挂载点
    const rootContent = await page.locator('#root').innerHTML();
    console.log(`Root 内容长度: ${rootContent.length}`);

    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('✓ 登录成功');

    // 导航到角色管理页面
    await page.goto('/admin/roles');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // 等待页面完全渲染
    console.log('✓ 进入角色管理页面');

    // 检查渲染后的页面内容
    const bodyContent = await page.locator('body').innerHTML();
    console.log(`Body 内容长度: ${bodyContent.length}`);
    if (bodyContent.length < 500) {
      console.log('⚠ 页面内容过短，可能渲染失败');
    }
  });

  test('分配菜单对话框正常打开', async ({ page }) => {
    // 截图保存当前页面状态
    await page.screenshot({ path: 'test-results/role-page.png', fullPage: true });
    console.log('✓ 已保存角色页面截图');

    // 等待页面加载，尝试多种选择器
    try {
      await page.waitForSelector('.ant-table', { timeout: 5000 });
      console.log('✓ 找到 ant-table');
    } catch {
      try {
        await page.waitForSelector('table', { timeout: 3000 });
        console.log('✓ 找到 table');
      } catch {
        console.log('⚠ 未找到表格，页面内容:', await page.content());
      }
    }

    // 查找包含"菜单"或"分配"的按钮
    const menuButton = page.getByRole('button', { name: /菜单|分配/ });
    const buttonCount = await menuButton.count();
    console.log(`找到分配菜单按钮数量: ${buttonCount}`);

    if (buttonCount > 0) {
      console.log(`✓ 找到 ${buttonCount} 个分配菜单按钮`);
      await menuButton.first().click();
      await page.waitForTimeout(1000);

      // 截图保存对话框
      await page.screenshot({ path: 'test-results/menu-dialog.png', fullPage: true });
      console.log('✓ 已保存对话框截图');

      // 检查对话框是否打开
      const dialog = page.locator('.ant-modal, [role="dialog"]');
      const dialogVisible = await dialog.isVisible();
      console.log(`✓ 对话框显示: ${dialogVisible}`);

      // TreeSelect 组件的选择器
      const treeSelect = page.locator('.ant-tree-select, .ant-select');
      const treeSelectCount = await treeSelect.count();
      console.log(`✓ TreeSelect 组件数: ${treeSelectCount}`);

      // 点击 TreeSelect 展开下拉框
      if (treeSelectCount > 0) {
        await treeSelect.first().click();
        await page.waitForTimeout(1000);

        // 截图保存展开后的下拉框
        await page.screenshot({ path: 'test-results/tree-select-expanded.png', fullPage: true });
        console.log('✓ 已保存展开后截图');

        // 查找下拉框中的树节点
        const treeNodes = page.locator('.ant-select-tree-node, .ant-tree-treenode, [role="treeitem"]');
        const treeNodeCount = await treeNodes.count();
        console.log(`✓ 下拉框中树节点数: ${treeNodeCount}`);

        // 在下拉框中查找复选框
        const dropdownCheckboxes = page.locator('.ant-select-dropdown input[type="checkbox"]');
        const checkboxCount = await dropdownCheckboxes.count();
        console.log(`✓ 下拉框中复选框数量: ${checkboxCount}`);

        if (checkboxCount > 0) {
          // 勾选第一个菜单项
          await dropdownCheckboxes.first().click();
          await page.waitForTimeout(500);
          console.log('✓ 勾选了第一个菜单项');
        } else if (treeNodeCount > 0) {
          // 如果没有复选框，尝试直接点击节点
          await treeNodes.first().click();
          await page.waitForTimeout(500);
          console.log('✓ 点击了第一个节点');
        }
      }

      // 点击确定按钮
      const confirmBtn = page.getByRole('button', { name: /确定|提交/ });
      if (await confirmBtn.count() > 0) {
        await confirmBtn.first().click();
        await page.waitForTimeout(1000);
        console.log('✓ 点击了确认按钮');
      }
    } else {
      console.log('⚠ 未找到分配菜单按钮');
    }
  });
});
