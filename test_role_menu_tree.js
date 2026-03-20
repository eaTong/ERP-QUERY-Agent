const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('1. Navigate to login page...');
    await page.goto('http://localhost:3020/login');
    await page.waitForLoadState('networkidle');

    console.log('2. Login...');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    console.log('3. Navigate to role management...');
    await page.click('text=角色管理');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    console.log('4. Click assign menu button...');
    await page.screenshot({ path: '/tmp/role_page_before.png', fullPage: true });

    // Find and click assign menu button
    const buttons = await page.locator('button').all();
    for (const btn of buttons) {
      const btnText = await btn.textContent();
      if (btnText && btnText.includes('分配菜单')) {
        console.log('Found button: ' + btnText);
        await btn.click();
        break;
      }
    }

    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/menu_tree_dropdown.png', fullPage: true });
    console.log('Screenshot saved to /tmp/menu_tree_dropdown.png');

    // Check for tree controls
    const treeNodes = await page.locator('.ant-tree, .ant-tree-select, [class*="tree"]').all();
    console.log('Tree controls found: ' + treeNodes.length);

    if (treeNodes.length === 0) {
      const dropdowns = await page.locator('.ant-modal, .ant-dropdown, .ant-select-dropdown').all();
      console.log('Modal/Dropdown found: ' + dropdowns.length);
    }

    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: '/tmp/error_screenshot.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
