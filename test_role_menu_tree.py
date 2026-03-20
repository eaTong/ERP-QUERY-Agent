# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # 登录
    print("1. Navigate to login page...")
    page.goto('http://localhost:3020/login')
    page.wait_for_load_state('networkidle')

    print("2. Login...")
    page.fill('input[type="text"]', 'admin')
    page.fill('input[type="password"]', 'admin123')
    page.click('button[type="submit"]')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)

    print("3. Navigate to role management...")
    page.click('text=角色管理')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)

    print("4. Click assign menu button...")
    page.screenshot(path='/tmp/role_page_before.png', full_page=True)

    # Find and click assign menu button
    buttons = page.locator('button').all()
    for btn in buttons:
        btn_text = btn.text_content() or ""
        if u'\u5206\u914d\u83DC\u5355' in btn_text:  # 分配菜单
            print("Found button: " + btn_text)
            btn.click()
            break

    page.wait_for_timeout(1000)
    page.screenshot(path='/tmp/menu_tree_dropdown.png', full_page=True)
    print("Screenshot saved to /tmp/menu_tree_dropdown.png")

    # Check for tree controls
    tree_nodes = page.locator('.ant-tree, .ant-tree-select, [class*="tree"]').all()
    print("Tree controls found: " + str(len(tree_nodes)))

    if len(tree_nodes) == 0:
        dropdowns = page.locator('.ant-modal, .ant-dropdown, .ant-select-dropdown').all()
        print("Modal/Dropdown found: " + str(len(dropdowns)))

    browser.close()
    print("Test completed")
