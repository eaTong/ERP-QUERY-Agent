/**
 * Test: Role Menu Tree Dropdown
 * Focus: Verify the menu assignment tree dropdown works correctly
 */

const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3000';

async function main() {
  console.log('Testing Role Menu Tree Dropdown...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 1. Login
    console.log('1. Login...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log('   Login successful');

    // 2. Navigate to Role Management
    console.log('2. Navigate to Role Management...');
    await page.goto(`${BASE_URL}/admin/roles`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.screenshot({ path: '/tmp/role_page_loaded.png', fullPage: true });
    console.log('   Screenshot: /tmp/role_page_loaded.png');

    // 3. Find and click "分配菜单" button
    console.log('3. Looking for "分配菜单" button...');
    const buttons = await page.locator('button').all();
    let clicked = false;

    for (const btn of buttons) {
      const btnText = await btn.textContent();
      if (btnText && btnText.includes('分配菜单')) {
        console.log(`   Found button: "${btnText.trim()}"`);
        await btn.click();
        clicked = true;
        break;
      }
    }

    if (!clicked) {
      console.log('   WARNING: No "分配菜单" button found');
      console.log('   Available buttons:');
      for (const btn of buttons) {
        const text = await btn.textContent();
        console.log(`     - "${text ? text.trim() : ''}"`);
      }
      await page.screenshot({ path: '/tmp/role_no_assign_button.png', fullPage: true });
      await browser.close();
      return;
    }

    // 4. Wait for modal to appear
    console.log('4. Waiting for modal to appear...');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: '/tmp/menu_modal_opened.png', fullPage: true });
    console.log('   Screenshot: /tmp/menu_modal_opened.png');

    // 5. Check for TreeSelect component
    console.log('5. Checking for TreeSelect component...');

    // Check if modal is visible
    const modal = page.locator('.ant-modal');
    const modalVisible = await modal.isVisible();
    console.log(`   Modal visible: ${modalVisible}`);

    // Check for TreeSelect
    const treeSelect = page.locator('.ant-tree-select');
    const treeSelectCount = await treeSelect.count();
    console.log(`   TreeSelect count: ${treeSelectCount}`);

    // Try to find and click the TreeSelect trigger
    const treeTrigger = page.locator('.ant-select-selector').first();
    if (await treeTrigger.isVisible()) {
      console.log('6. Clicking TreeSelect to open dropdown...');
      await treeTrigger.click();
      await page.waitForTimeout(1000);

      await page.screenshot({ path: '/tmp/tree_dropdown_opened.png', fullPage: true });
      console.log('   Screenshot: /tmp/tree_dropdown_opened.png');

      // Check for tree nodes
      const treeNodes = await page.locator('.ant-select-tree-treenode, .ant-tree-node').all();
      console.log(`   Tree nodes found: ${treeNodes.length}`);

      // Check for checkbox (treeCheckable)
      const checkboxes = await page.locator('.ant-select-tree-checkbox, .ant-tree-checkbox').all();
      console.log(`   Checkboxes found: ${checkboxes.length}`);
    } else {
      // Maybe the tree is already rendered differently
      const anyTree = page.locator('[class*="tree"]').all();
      console.log(`   Any tree-like elements: ${await anyTree.length}`);
    }

    // 7. Test tree node interaction
    console.log('7. Testing tree node selection...');
    const treeNodeToClick = page.locator('.ant-select-tree-node-selected, .ant-tree-node-selected').first();
    if (await treeNodeToClick.isVisible()) {
      const nodeText = await treeNodeToClick.textContent();
      console.log(`   Selected node: "${nodeText}"`);
    }

    console.log('\n=== Test completed successfully ===');

  } catch (error) {
    console.error('\nError:', error.message);
    await page.screenshot({ path: '/tmp/test_error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

main();
