import { test, expect } from '@playwright/test';

test.describe('查询历史页面', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('http://localhost:3022/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('✓ 登录成功');
  });

  test('查询页面应该正常显示', async ({ page }) => {
    // 导航到查询页面
    await page.goto('http://localhost:3022/query');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 截图保存当前页面状态
    await page.screenshot({ path: 'test-results/query-page.png', fullPage: true });
    console.log('✓ 已保存查询页面截图');

    // 检查页面主体内容
    const bodyContent = await page.locator('body').innerHTML();
    console.log(`Body 内容长度: ${bodyContent.length}`);

    // 查找 AI 智能查询 标题
    const title = page.locator('text=AI 智能查询');
    const titleVisible = await title.isVisible();
    console.log(`AI 智能查询标题可见: ${titleVisible}`);

    // 查找历史按钮
    const historyBtn = page.locator('button:has-text("历史")');
    const historyBtnVisible = await historyBtn.isVisible();
    console.log(`历史按钮可见: ${historyBtnVisible}`);

    if (historyBtnVisible) {
      // 点击历史按钮
      await historyBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/history-drawer.png', fullPage: true });
      console.log('✓ 已保存历史抽屉截图');

      // 检查抽屉是否打开 - 使用 ant-drawer-open 类
      const drawerOpen = page.locator('.ant-drawer-open');
      const drawerVisible = await drawerOpen.isVisible();
      console.log(`历史抽屉可见: ${drawerVisible}`);

      // 检查是否有加载状态
      const spinLoading = page.locator('.ant-spin');
      const hasSpin = await spinLoading.count();
      console.log(`加载状态元素数量: ${hasSpin}`);

      // 检查是否有空状态提示
      const emptyState = page.locator('.ant-empty');
      const hasEmpty = await emptyState.count();
      console.log(`空状态元素数量: ${hasEmpty}`);

      // 检查抽屉内容
      const drawerContent = page.locator('.ant-drawer-body');
      const drawerBodyVisible = await drawerContent.isVisible();
      console.log(`抽屉内容可见: ${drawerBodyVisible}`);

      if (drawerBodyVisible) {
        const drawerBodyHtml = await drawerContent.innerHTML();
        console.log(`抽屉内容 HTML 长度: ${drawerBodyHtml.length}`);
        console.log(`抽屉内容前200字符: ${drawerBodyHtml.substring(0, 200)}`);
      }
    }
  });
});
