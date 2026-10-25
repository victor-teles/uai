import { expect, test } from "@playwright/test";
import { openComponent, PREVIEW } from "./helpers";

/** Address Form's lookup contract in a real browser: cascade, focus, and native validation. */
test.describe("address form", () => {
  test.skip(({ isMobile }) => isMobile, "Keyboard and focus checks run on desktop.");

  test("fills the address from the CEP and moves focus to Número", async ({ page }) => {
    await openComponent(page, "address-form");
    const preview = page.locator(PREVIEW);
    // The preview opens on a found address; its cascade proves the page is hydrated.
    await expect(preview.locator("[data-filled]")).toHaveCount(4);
    const cep = preview.getByRole("textbox", { name: "CEP" });
    await cep.fill("");
    await cep.pressSequentially("35460000");
    await expect(preview.getByRole("status")).toHaveText(
      "Encontramos a cidade. Preencha a rua e o bairro.",
    );
    await expect(preview.getByRole("textbox", { name: "Rua" })).toBeFocused();

    await cep.fill("");
    await cep.pressSequentially("30130110");
    await expect(preview.getByRole("textbox", { name: "Rua" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    await expect(preview.getByRole("textbox", { name: "Número" })).toBeFocused();
    await expect(preview.getByRole("textbox", { name: "Rua" })).toHaveValue("Avenida Afonso Pena");
    await expect(preview.getByRole("status")).toContainText(
      "Endereço encontrado: Avenida Afonso Pena, Centro, Belo Horizonte, MG. Informe o número.",
    );
    await expect(preview.locator("[data-filled]")).toHaveCount(4);
  });

  test("blocks the consumer form's submit with inline errors and focuses the first", async ({
    page,
  }) => {
    await openComponent(page, "address-form");
    const preview = page.locator(PREVIEW);
    // The preview opens on a found address; its cascade proves the page is hydrated.
    await expect(preview.locator("[data-filled]")).toHaveCount(4);
    const cep = preview.getByRole("textbox", { name: "CEP" });
    await cep.fill("");
    await cep.pressSequentially("99999999");
    await expect(preview.getByRole("textbox", { name: "Rua" })).toBeFocused();
    await preview.getByRole("button", { name: "Continuar" }).click();
    await expect(preview.getByText('Informe o número ou marque "Sem número".')).toBeVisible();
    await expect(preview.getByRole("textbox", { name: "Rua" })).toBeFocused();
    await preview.getByRole("checkbox", { name: "Sem número" }).click();
    await expect(preview.getByRole("textbox", { name: "Número" })).toBeDisabled();
    await expect(preview.getByText('Informe o número ou marque "Sem número".')).toHaveCount(0);
  });
});
