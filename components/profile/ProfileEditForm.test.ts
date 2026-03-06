import { describe, expect, test } from "bun:test";

// Extraemos la lógica de validación del componente
const validateSocialLinks = (links: { linkedin?: string; github?: string }) => {
  const errors: { [key: string]: string } = {};
  if (
    links.linkedin &&
    !links.linkedin.match(/^https:\/\/(www\.)?linkedin\.com\/.*$/)
  ) {
    errors.linkedin = "URL de LinkedIn inválida";
  }
  if (
    links.github &&
    !links.github.match(/^https:\/\/(www\.)?github\.com\/.*$/)
  ) {
    errors.github = "URL de GitHub inválida";
  }
  return errors;
};

describe("ProfileEditForm - Validación de Enlaces (Caja Blanca)", () => {
  test("Debería detectar una URL de LinkedIn falsa", () => {
    const errors = validateSocialLinks({
      linkedin: "https://facebook.com/user",
    });
    expect(errors.linkedin).toBeDefined();
  });

  test("Debería aceptar una URL de GitHub válida", () => {
    const errors = validateSocialLinks({
      github: "https://github.com/cristiangomez",
    });
    expect(errors.github).toBeUndefined();
  });
});
