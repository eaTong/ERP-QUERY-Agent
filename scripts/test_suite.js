/**
 * ERP Query Agent - Playwright E2E Test Suite
 *
 * Usage:
 *   1. Ensure frontend is running on port 3000
 *   2. Run: npx playwright test e2e/test_suite.js
 *
 * Or use with server manager:
 *   python scripts/with_server.py \
 *     --server "cd frontend && npm run dev" --port 3000 \
 *     -- npx playwright test e2e/test_suite.js
 */

const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3000';
const TEST_USER = { username: 'admin', password: 'admin123' };

// Helper: Login
async function login(page) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="text"]', TEST_USER.username);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

// Helper: Navigate to page
async function navigateTo(page, path) {
  await page.goto(`${BASE_URL}/${path}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

// Helper: Take screenshot
async function screenshot(page, name) {
  await page.screenshot({ path: `/tmp/erp_${name}.png`, fullPage: true });
  console.log(`  Screenshot: /tmp/erp_${name}.png`);
}

// ============================================================================
// TEST: Login Page
// ============================================================================
async function testLoginPage(browser) {
  console.log('\n=== Test: Login Page ===');
  const page = await browser.newPage();

  try {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Verify login form elements exist
    const usernameInput = await page.locator('input[type="text"]').isVisible();
    const passwordInput = await page.locator('input[type="password"]').isVisible();
    const submitBtn = await page.locator('button[type="submit"]').isVisible();

    console.log(`  Username input visible: ${usernameInput}`);
    console.log(`  Password input visible: ${passwordInput}`);
    console.log(`  Submit button visible: ${submitBtn}`);

    // Test login functionality
    await page.fill('input[type="text"]', TEST_USER.username);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Check if redirected to dashboard
    const currentUrl = page.url();
    console.log(`  After login URL: ${currentUrl}`);

    if (currentUrl.includes('/login')) {
      console.log('  WARNING: Still on login page after submit');
    } else {
      console.log('  Login successful - redirected to dashboard');
    }

    await screenshot(page, 'login_page');
  } finally {
    await page.close();
  }
}

// ============================================================================
// TEST: Dashboard Page
// ============================================================================
async function testDashboardPage(browser) {
  console.log('\n=== Test: Dashboard Page ===');
  const page = await browser.newPage();

  try {
    await login(page);
    await navigateTo(page, 'dashboard');
    await screenshot(page, 'dashboard');

    // Check dashboard elements
    const content = await page.content();
    const hasContent = content.includes('仪表盘') || content.includes('Dashboard') || content.includes('统计');
    console.log(`  Dashboard content visible: ${hasContent}`);
  } finally {
    await page.close();
  }
}

// ============================================================================
// TEST: Role Management - Menu Tree Dropdown
// ============================================================================
async function testRoleMenuTreeDropdown(browser) {
  console.log('\n=== Test: Role Management - Menu Tree Dropdown ===');
  const page = await browser.newPage();

  try {
    await login(page);
    await navigateTo(page, 'admin/roles');
    await screenshot(page, 'role_list');

    // Find and click "分配菜单" button
    const buttons = await page.locator('button').all();
    let foundAssignBtn = false;

    for (const btn of buttons) {
      const btnText = await btn.textContent();
      if (btnText && btnText.includes('分配菜单')) {
        console.log('  Found "分配菜单" button');
        await btn.click();
        foundAssignBtn = true;
        break;
      }
    }

    if (!foundAssignBtn) {
      console.log('  WARNING: No "分配菜单" button found');
      await screenshot(page, 'role_no_button');
      return;
    }

    await page.waitForTimeout(1000);
    await screenshot(page, 'menu_tree_modal');

    // Check if TreeSelect dropdown is visible
    const treeSelect = page.locator('.ant-tree-select, .ant-select');
    const treeCount = await treeSelect.count();
    console.log(`  TreeSelect/Dropdown elements found: ${treeCount}`);

    // Try to open the tree dropdown
    const treeSelectTrigger = page.locator('.ant-select-selector, .ant-tree-select-selector').first();
    if (await treeSelectTrigger.isVisible()) {
      console.log('  TreeSelect is visible - clicking to open...');
      await treeSelectTrigger.click();
      await page.waitForTimeout(500);
      await screenshot(page, 'menu_tree_opened');
    }

    // Check for tree nodes
    const treeNodes = await page.locator('.ant-tree-treenode, .ant-tree-node').all();
    console.log(`  Tree nodes found: ${treeNodes.length}`);

  } finally {
    await page.close();
  }
}

// ============================================================================
// TEST: Role Management - CRUD Operations
// ============================================================================
async function testRoleCRUD(browser) {
  console.log('\n=== Test: Role Management - CRUD ===');
  const page = await browser.newPage();

  try {
    await login(page);
    await navigateTo(page, 'admin/roles');
    await screenshot(page, 'role_crud_init');

    // Test: Add Role
    console.log('  Testing Add Role...');
    const addBtn = page.locator('button:has-text("添加角色")');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);

      // Fill form
      await page.fill('input#name, input[placeholder*="角色"]', '测试角色');
      await page.fill('input#code, input[placeholder*="代码"]', 'test_role_' + Date.now());

      await screenshot(page, 'role_crud_add_form');

      // Submit
      const submitBtn = page.locator('button:has-text("确定")');
      await submitBtn.click();
      await page.waitForTimeout(1000);
      await screenshot(page, 'role_crud_after_add');
      console.log('  Add role completed');
    }

  } finally {
    await page.close();
  }
}

// ============================================================================
// TEST: User Management
// ============================================================================
async function testUserManagement(browser) {
  console.log('\n=== Test: User Management ===');
  const page = await browser.newPage();

  try {
    await login(page);
    await navigateTo(page, 'admin/users');
    await screenshot(page, 'user_list');

    // Check user table exists
    const table = page.locator('.ant-table');
    const tableVisible = await table.isVisible();
    console.log(`  User table visible: ${tableVisible}`);

    // Test Add User modal
    const addBtn = page.locator('button:has-text("添加用户")');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      await screenshot(page, 'user_add_modal');

      // Close modal
      const cancelBtn = page.locator('.ant-modal button:has-text("取消")');
      await cancelBtn.click();
      await page.waitForTimeout(300);
    }

  } finally {
    await page.close();
  }
}

// ============================================================================
// TEST: Menu Management
// ============================================================================
async function testMenuManagement(browser) {
  console.log('\n=== Test: Menu Management ===');
  const page = await browser.newPage();

  try {
    await login(page);
    await navigateTo(page, 'admin/menus');
    await screenshot(page, 'menu_list');

    // Check menu table
    const table = page.locator('.ant-table');
    console.log(`  Menu table visible: ${await table.isVisible()}`);

    // Test Add Menu
    const addBtn = page.locator('button:has-text("添加菜单")');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      await screenshot(page, 'menu_add_modal');
    }

  } finally {
    await page.close();
  }
}

// ============================================================================
// TEST: Data Source Management
// ============================================================================
async function testDataSourceManagement(browser) {
  console.log('\n=== Test: Data Source Management ===');
  const page = await browser.newPage();

  try {
    await login(page);
    await navigateTo(page, 'datasource/list');
    await screenshot(page, 'datasource_list');

    // Check datasource table
    const table = page.locator('.ant-table');
    console.log(`  DataSource table visible: ${await table.isVisible()}`);

    // Test Add DataSource
    const addBtn = page.locator('button:has-text("添加数据源")');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      await screenshot(page, 'datasource_add_modal');

      // Check form elements
      const form = page.locator('.ant-form');
      console.log(`  Form visible: ${await form.isVisible()}`);

      // Close modal
      const cancelBtn = page.locator('.ant-modal button:has-text("取消")');
      await cancelBtn.click();
    }

  } finally {
    await page.close();
  }
}

// ============================================================================
// TEST: Prompt Rule Management
// ============================================================================
async function testPromptRuleManagement(browser) {
  console.log('\n=== Test: Prompt Rule Management ===');
  const page = await browser.newPage();

  try {
    await login(page);
    await navigateTo(page, 'datasource/prompts');
    await screenshot(page, 'prompt_list');

    // Check prompt table
    const table = page.locator('.ant-table');
    console.log(`  Prompt table visible: ${await table.isVisible()}`);

    // Test Add Prompt Rule
    const addBtn = page.locator('button:has-text("添加规则")');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      await screenshot(page, 'prompt_add_modal');
    }

  } finally {
    await page.close();
  }
}

// ============================================================================
// TEST: Table Mapping Management
// ============================================================================
async function testTableMappingManagement(browser) {
  console.log('\n=== Test: Table Mapping Management ===');
  const page = await browser.newPage();

  try {
    await login(page);
    await navigateTo(page, 'datasource/mappings');
    await screenshot(page, 'mapping_list');

    // Check mapping table
    const table = page.locator('.ant-table');
    console.log(`  Table Mapping table visible: ${await table.isVisible()}`);

    // Test Add Mapping
    const addBtn = page.locator('button:has-text("添加映射")');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      await screenshot(page, 'mapping_add_modal');
    }

  } finally {
    await page.close();
  }
}

// ============================================================================
// TEST: AI Query Page
// ============================================================================
async function testAIQueryPage(browser) {
  console.log('\n=== Test: AI Query Page ===');
  const page = await browser.newPage();

  try {
    await login(page);
    await navigateTo(page, 'query');
    await screenshot(page, 'query_page');

    // Check query input
    const textarea = page.locator('textarea');
    console.log(`  Query textarea visible: ${await textarea.isVisible()}`);

    // Check query button
    const queryBtn = page.locator('button:has-text("查询")');
    console.log(`  Query button visible: ${await queryBtn.isVisible()}`);

    // Check history button
    const historyBtn = page.locator('button:has-text("历史")');
    console.log(`  History button visible: ${await historyBtn.isVisible()}`);

  } finally {
    await page.close();
  }
}

// ============================================================================
// MAIN: Run All Tests
// ============================================================================
async function main() {
  console.log('========================================');
  console.log('ERP Query Agent - E2E Test Suite');
  console.log('========================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test User: ${TEST_USER.username}`);

  const browser = await chromium.launch({ headless: true });

  try {
    await testLoginPage(browser);
    await testDashboardPage(browser);
    await testRoleMenuTreeDropdown(browser);
    await testRoleCRUD(browser);
    await testUserManagement(browser);
    await testMenuManagement(browser);
    await testDataSourceManagement(browser);
    await testPromptRuleManagement(browser);
    await testTableMappingManagement(browser);
    await testAIQueryPage(browser);

    console.log('\n========================================');
    console.log('All tests completed!');
    console.log('========================================');
    console.log('Screenshots saved to /tmp/erp_*.png');
  } catch (error) {
    console.error('\nTest error:', error.message);
    await browser.close();
    process.exit(1);
  }

  await browser.close();
}

main();
