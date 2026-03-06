import { test, expect } from '@playwright/test';

test.describe('Dashboard - Chatbot Analítico', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="username"]', 'juanlozano30@hotmail.com');
        await page.fill('input[name="password"]', 'gonostrofia');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard/**');
    });

    test('Acceso e Inicialización del Chatbot Apex', async ({ page }) => {
        // Navegar a la página del Chat
        await page.goto('/dashboard/chat');

        // Verificar Componentes Visuales del Cerebro
        await expect(page.locator('h2')).toContainText('Apex Vendor', { ignoreCase: true });

        // El input del chat debe estar presente y habilitado
        const chatInput = page.locator('input[placeholder*="Describe el proyecto"]');
        await expect(chatInput).toBeVisible();
        await expect(chatInput).toBeEnabled();
    });

    test('Validar Panel de Definición de Métricas', async ({ page }) => {
        await page.goto('/dashboard/chat');

        // Verificar el botón que abre las métricas
        const metricBtn = page.locator('button', { hasText: 'Métricas' });
        await expect(metricBtn).toBeVisible();
        await metricBtn.click();

        // Verificación del modal
        await expect(page.locator('div[role="dialog"]').or(page.locator('h3'))).toBeVisible();
    });
});
