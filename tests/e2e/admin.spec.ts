import { test, expect } from '@playwright/test';

test.describe('Navegación del Dashboard de Administrador', () => {
    // Hook que se ejecuta antes de cada test: iniciar sesión
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="username"]', 'juanlozano30@hotmail.com'); // Necesitas asegurar que este usuario exista en la DB local
        await page.fill('input[name="password"]', 'gonostrofia');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard/**');
    });

    test('Verificar visualización del Directorio de Proveedores', async ({ page }) => {
        // Navegar haciendo clic en el enlace del Navbar
        await page.click('a[href="/dashboard/vendors"]');

        // Esperar a que la página cargue
        await page.waitForURL('**/dashboard/vendors');

        // Validar el título de la página
        await expect(page.locator('h2')).toContainText('Directorio de Proveedores', { ignoreCase: true });

        // Validar que el botón de "Crear Administrador" o "+ Admin" exista
        await expect(page.locator('button', { hasText: '+ Admin' })).toBeVisible();
    });

    test('Verificar visualización de la lista de Proyectos', async ({ page }) => {
        await page.goto('/dashboard/projects');
        await expect(page.locator('h2')).toContainText('Proyectos', { ignoreCase: true });
        await expect(page.locator('button', { hasText: 'Nuevo Proyecto' })).toBeVisible();
    });
});
