import { test, expect } from "@playwright/test";

const FRONTEND_URL = "http://localhost:5173";
const BACKEND_URL = "http://localhost:8081";

// Teacher credentials
const TEACHER_EMAIL = "john@uni.nl";
const TEACHER_PASSWORD = "123";

// Student credentials
const STUDENT_EMAIL = "realgihila@gmail.com";
const STUDENT_PASSWORD = "123";

async function loginByApi(request, email, password) {
  const response = await request.post(`${BACKEND_URL}/auth/login`, {
    data: { email, password },
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();

  return {
    token: body.token,
    email: body.email,
    roles: body.roles,
  };
}

async function openAppAsUser(page, userAuth) {
  await page.addInitScript((auth) => {
    localStorage.setItem("token", auth.token);
    localStorage.setItem("email", auth.email);
    localStorage.setItem("roles", JSON.stringify(auth.roles));
  }, userAuth);

  await page.goto(FRONTEND_URL);
}

// Teacher flow
test("teacher can open MiniCanvas and see assignments tab", async ({ page, request }) => {
  const teacherAuth = await loginByApi(request, TEACHER_EMAIL, TEACHER_PASSWORD);
  await openAppAsUser(page, teacherAuth);

  // Sidebar menu items
  await expect(page.locator('aside .sidebar-menu-item', { hasText: 'Announcements' })).toBeVisible();
  await expect(page.locator('aside .sidebar-menu-item', { hasText: 'Assignments' })).toBeVisible();

  // Click Assignments
  await page.locator('aside .sidebar-menu-item', { hasText: 'Assignments' }).click();

  // Verify main content heading
  await expect(page.locator('main .student-content-box h3', { hasText: 'Assignments' })).toBeVisible();
});

// Student flow
test("student can open MiniCanvas and see assignments tab", async ({ page, request }) => {
  const studentAuth = await loginByApi(request, STUDENT_EMAIL, STUDENT_PASSWORD);
  await openAppAsUser(page, studentAuth);

  // Sidebar menu items
  await expect(page.locator('aside .sidebar-menu-item', { hasText: 'Announcements' })).toBeVisible();
  await expect(page.locator('aside .sidebar-menu-item', { hasText: 'Assignments' })).toBeVisible();

  // Click Assignments
  await page.locator('aside .sidebar-menu-item', { hasText: 'Assignments' }).click();

  // Verify main content heading
  await expect(page.locator('main .student-content-box h3', { hasText: 'Assignments' })).toBeVisible();
});