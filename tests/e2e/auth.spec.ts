import { test, expect } from '@playwright/test';

test.describe('Autenticación y Control de Acceso', () => {

    test('Caso A: Inicio de sesión exitoso con credenciales válidas (Administrador)', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[name="username"]', 'juanlozano30@hotmail.com');
        await page.fill('input[name="password"]', 'gonostrofia');

        await page.click('button[type="submit"]');

        // Debe ser redirigido al dashboard
        await page.waitForURL('**/dashboard/**');

        // Verificar que un elemento clave de la página del admin esté presente
        await expect(page.locator('text=ApexVendor')).toBeVisible();
    });

    test('Caso A.2: Inicio de sesión exitoso con credenciales válidas (Proveedor)', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[name="username"]', 'jplozanot@unbosque.edu.co');
        await page.fill('input[name="password"]', 'juan123456');

        await page.click('button[type="submit"]');

        // Debe ser redirigido al perfil
        await page.waitForURL('**/dashboard/profile');

        // Verificar que cargó su panel (buscando algún texto descriptivo del perfil)
        await expect(page.locator('body')).toContainText('Credenciales', { ignoreCase: true });
    });

    test('Caso B: Fallo al iniciar sesión con credenciales inválidas', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[name="username"]', 'falso_juan123@hotmail.com');
        await page.fill('input[name="password"]', 'contrasena_incorrecta');

        page.on('dialog', async dialog => {
            expect(dialog.message().length).toBeGreaterThan(0);
            await dialog.dismiss();
        });

        await page.click('button[type="submit"]');

        await page.waitForTimeout(500);
    });

    test('Caso C: Bloqueo de rutas protegidas para usuarios no autenticados', async ({ page }) => {
        // Intentar acceder directamente al directorio de proveedores sin iniciar sesión
        await page.goto('/dashboard/vendors');

        // El middleware o layout debería expulsarlo a login
        await page.waitForURL('**/login**');
        await expect(page).toHaveURL(/.*\/login/);
    });

});
