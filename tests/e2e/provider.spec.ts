import { test, expect } from '@playwright/test';

test.describe('Navegación y Operaciones de Proveedor', () => {
    test.beforeEach(async ({ page }) => {
        // Login con credenciales reales de proveedor
        await page.goto('/login');
        await page.fill('input[name="username"]', 'jplozanot@unbosque.edu.co');
        await page.fill('input[name="password"]', 'juan123456');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard/profile');
    });

    test('Verificar Datos Principales en Perfil', async ({ page }) => {
        // El titulo de Credenciales
        await expect(page.locator('body')).toContainText('Credenciales', { ignoreCase: true });

        // El score global
        await expect(page.locator('text=Apex Performance Score').first()).toBeVisible();

        // Los botones de redes sociales o contacto
        await expect(page.locator('h4', { hasText: 'Redes sociales' })).toBeVisible();
    });

    test('Abrir Modal de Edición de Contacto', async ({ page }) => {
        // En base a la vista de ProfileView, hay un botón con el label exacto "Actualizar" (junto a Datos adicionales)
        // Usamos Regex Exacto para evitar "Actualizar Tarifa" o "Actualizar Horarios"
        const btnActualizar = page.locator('button', { hasText: /^Actualizar$/ }).first();
        await btnActualizar.click();

        // El Modal generico usa un <h2> para el título
        await expect(page.locator('h2', { hasText: 'Contacto' })).toBeVisible({ timeout: 10000 });

        // Cerrar modal usando la tecla Escape, que es universal
        await page.keyboard.press('Escape');
    });

    test('Visualización de Tabla de Documentos Externa', async ({ page }) => {
        // En el ProfileView, las certificaciones no muesran un header h4 con ese texto
        // En su lugar buscaremos el container de texto general "Certificaciones"
        await expect(page.locator('text=Certificaciones').first()).toBeVisible();
    });

    test('Seguridad: Intento de Bypass de Roles (Admin Dashboard)', async ({ page }) => {
        // El proveedor intentará navegar forzadamente a una ruta de administrador
        await page.goto('/dashboard/projects');

        // El page.tsx de projects revisa la DB y expulsa al usuario
        // Debe ser redirigido a profile con error
        await expect(page).toHaveURL(/.*\/dashboard\/profile\?error=unauthorized/);
    });

    test('Edge Case: Bloqueo de Subida de Archivos Corruptos/No-PDF', async ({ page }) => {
        // Navegar directo al perfil (ya estamos ahi por el beforeEach, pero asegura el estado)
        await page.goto('/dashboard/profile');

        // Llenar datos requeridos mínimos. En la UI son inputs con placeholders específicos, no names fijos
        await page.locator('input[placeholder="Nombre"]').fill('Certificado Hack');
        await page.locator('input[placeholder="Emisor"]').fill('Hacker Corp');

        // Hay dos inputs tipo date (emision y expiracion). El primero es emisión.
        await page.locator('input[type="date"]').first().fill('2023-01-01');

        // Subir un archivo "PNG" falso directo al input file
        // Playwright permite inyectar buffers como archivos
        const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser'),
            page.locator('label', { hasText: 'Seleccionar PDF' }).click()
        ]);

        await fileChooser.setFiles({
            name: 'virus.png',
            mimeType: 'image/png',
            buffer: Buffer.from('fake-image-content')
        });

        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('Solo se permiten PDFs');
            await dialog.dismiss();
        });

        // Intentar guardar (esto llamaría la Action y disparará el alert)
        await page.locator('button', { hasText: '+ Agregar' }).click();

        // Esperar un momento a que se dispare el diálogo interactivo
        await page.waitForTimeout(500);
    });
});
