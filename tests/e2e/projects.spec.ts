import { test, expect } from '@playwright/test';

test.describe('Gestión de Proyectos (Administrativa)', () => {
    test.beforeEach(async ({ page }) => {
        // Login con credenciales de admin
        await page.goto('/login');
        await page.fill('input[name="username"]', 'juanlozano30@hotmail.com');
        await page.fill('input[name="password"]', 'gonostrofia');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard/**');
    });

    test('Validar Renderizado del Directorio de Proyectos', async ({ page }) => {
        await page.goto('/dashboard/projects');

        // Verificar Título principal
        await expect(page.locator('h2')).toContainText('Proyectos', { ignoreCase: true });

        // Verificar botón de Nuevo Proyecto
        const createBtn = page.locator('button', { hasText: 'Nuevo Proyecto' });
        await expect(createBtn).toBeVisible();
    });

    test('Validar Estructura del Modal de Nuevo Proyecto', async ({ page }) => {
        await page.goto('/dashboard/projects');

        // Abrir el modal de creación
        await page.locator('button', { hasText: 'Nuevo Proyecto' }).click();

        // Validar existencia de campos requeridos (hay 2 fechas, inicio y fin)
        await expect(page.locator('input[name="nombre"]')).toBeVisible();
        await expect(page.locator('input[name="cliente"]')).toBeVisible();
        await expect(page.locator('input[name="inicio"]')).toBeVisible();

        // Cerrar modal
        await page.keyboard.press('Escape');
    });

    test('Edge Case: Prevención de Fechas Invertidas (Fin antes de Inicio)', async ({ page }) => {
        await page.goto('/dashboard/projects');

        // Abrir el modal de creación
        await page.locator('button', { hasText: 'Nuevo Proyecto' }).click();

        // Llenar campos obligatorios
        await page.fill('input[name="cliente"]', 'HackTheBank');
        await page.fill('input[name="nombre"]', 'Proyecto Paradoja');

        // Establecer Fecha de Fin (Ej: 1 Enero 2025) ANTES de Fecha de Inicio (Ej: 31 Dic 2025)
        await page.fill('input[name="inicio"]', '2025-12-31');
        await page.fill('input[name="fin"]', '2025-01-01');

        // Enviar el formulario
        await page.locator('button[type="submit"]', { hasText: 'Crear proyecto' }).click();

        // El backend responde con el error exacto: "La fecha fin no puede ser anterior a inicio"
        await expect(page.locator('text=La fecha fin no puede ser anterior a inicio')).toBeVisible({ timeout: 10000 });
    });
});
