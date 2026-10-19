import { afterEach, expect, test } from "bun:test";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import {
  ADDRESS_FORM_VARIANTS,
  type Address,
  AddressForm,
  AddressFormActions,
  AddressFormCep,
  AddressFormCity,
  AddressFormComplement,
  AddressFormDistrict,
  AddressFormFields,
  AddressFormHeader,
  type AddressFormLookupStatus,
  AddressFormNumber,
  AddressFormState,
  AddressFormStreet,
  AddressFormSubmit,
  AddressFormSummary,
  type AddressFormVariant,
  type AddressLookupResult,
  BRAZIL_STATES,
  EMPTY_ADDRESS,
  getMissingAddressFields,
} from "@/registry/uai/blocks/address-form";

const afonsoPena: AddressLookupResult = {
  street: "Avenida Afonso Pena",
  district: "Centro",
  city: "Belo Horizonte",
  state: "MG",
};

type Harness = {
  resolve: (status: AddressFormLookupStatus, result?: AddressLookupResult | null) => void;
  lookups: string[];
  address: () => Address;
};

function Fixture({
  harness,
  variant = "stacked",
  defaultValue,
}: {
  harness: Harness;
  variant?: AddressFormVariant;
  defaultValue?: Partial<Address>;
}) {
  const [address, setAddress] = useState<Address>({ ...EMPTY_ADDRESS, ...defaultValue });
  const [status, setStatus] = useState<AddressFormLookupStatus>("idle");
  const [result, setResult] = useState<AddressLookupResult | null>(null);
  harness.address = () => address;
  harness.resolve = (next, nextResult = null) => {
    setResult(nextResult);
    setStatus(next);
  };
  return (
    <form aria-label="Checkout" onSubmit={(event) => event.preventDefault()}>
      <AddressForm
        variant={variant}
        value={address}
        onValueChange={setAddress}
        lookupStatus={status}
        lookupResult={result}
        onLookup={(cep) => {
          harness.lookups.push(cep);
          setStatus("looking-up");
        }}
      >
        <AddressFormHeader />
        <AddressFormFields>
          <AddressFormCep helpHref="https://buscacepinter.correios.com.br/" />
          <AddressFormStreet />
          <AddressFormNumber />
          <AddressFormComplement />
          <AddressFormDistrict />
          <AddressFormCity />
          <AddressFormState />
        </AddressFormFields>
        <AddressFormSummary />
        <AddressFormActions>
          <AddressFormSubmit />
        </AddressFormActions>
      </AddressForm>
    </form>
  );
}

function setup(variant?: AddressFormVariant, defaultValue?: Partial<Address>) {
  const harness = { lookups: [] } as unknown as Harness;
  const user = userEvent.setup();
  const view = render(<Fixture harness={harness} variant={variant} defaultValue={defaultValue} />);
  return { harness, user, view };
}

const field = (name: string) => screen.getByRole("textbox", { name }) as HTMLInputElement;
const markers = (container: HTMLElement) => container.querySelectorAll("[data-filled]");

const realMatchMedia = window.matchMedia;
afterEach(() => {
  window.matchMedia = realMatchMedia;
});

function reduceMotion() {
  window.matchMedia = ((query: string) => ({
    ...realMatchMedia.call(window, query),
    matches: query.includes("prefers-reduced-motion"),
  })) as typeof window.matchMedia;
}

test("exports its variants and the 27 federative units", () => {
  expect(ADDRESS_FORM_VARIANTS).toEqual(["stacked", "split", "compact"]);
  expect(BRAZIL_STATES).toHaveLength(27);
  expect(() => render(<AddressFormStreet />)).toThrow(
    "AddressFormStreet must be used within AddressForm",
  );
});

test("nests in the consumer form as a named fieldset with autocomplete tokens", () => {
  const { view } = setup();
  expect(view.container.querySelectorAll("form").length).toBe(1);
  const group = screen.getByRole("group", { name: "Endereço de entrega" });
  expect(group.tagName).toBe("FIELDSET");
  expect(group.getAttribute("aria-describedby")).toBeTruthy();
  expect(field("CEP").autocomplete).toBe("postal-code");
  expect(field("Rua").autocomplete).toBe("address-line1");
  expect(field("Complemento").autocomplete).toBe("address-line2");
  expect(field("Bairro").autocomplete).toBe("address-level3");
  expect(field("Cidade").autocomplete).toBe("address-level2");
  expect(view.container.querySelector<HTMLInputElement>('input[name="state"]')?.autocomplete).toBe(
    "address-level1",
  );
  expect(screen.getByRole("combobox", { name: "UF" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "Não sei meu CEP" })).toBeTruthy();
  // Split only.
  expect(view.container.querySelector('[data-slot="address-form-summary"]') === null).toBe(true);
});

test("looks up, cascades the found address with markers, announces it, and focuses Número", async () => {
  const { harness, user, view } = setup();
  await user.type(field("CEP"), "30130110");
  expect(harness.lookups).toEqual(["30130110"]);

  expect(screen.getByRole("status").textContent).toContain("Buscando endereço…");
  for (const name of ["Rua", "Bairro", "Cidade"]) {
    expect(field(name).getAttribute("aria-busy")).toBe("true");
    expect(field(name).disabled).toBe(false);
  }
  expect(screen.getByRole("combobox", { name: "UF" }).getAttribute("aria-busy")).toBe("true");
  expect(view.container.querySelectorAll('[data-slot="address-form-skeleton"]').length).toBe(4);

  act(() => harness.resolve("found", afonsoPena));
  await waitFor(() => expect(document.activeElement?.id).toBe(field("Número").id));
  await waitFor(() => expect(markers(view.container).length).toBe(4));

  expect(field("Rua").value).toBe("Avenida Afonso Pena");
  expect(field("Bairro").value).toBe("Centro");
  expect(field("Cidade").value).toBe("Belo Horizonte");
  expect(harness.address().state).toBe("MG");
  expect(field("Rua").getAttribute("aria-busy")).toBeNull();
  const status = screen.getByRole("status");
  expect(status.textContent).toContain(
    "Endereço encontrado: Avenida Afonso Pena, Centro, Belo Horizonte, MG. Informe o número.",
  );
  expect(
    within(status).getByText("Endereço encontrado. Falta só o número.").getAttribute("aria-hidden"),
  ).toBe("true");
  const description = document.getElementById(
    field("Rua").getAttribute("aria-describedby")?.split(" ")[0] ?? "",
  );
  expect(description?.textContent).toBe("Preenchido pelo CEP");
});

test("partial results fill the city and UF and move focus to Rua", async () => {
  const { harness, user, view } = setup();
  await user.type(field("CEP"), "35460000");
  act(() => harness.resolve("partial", { city: "Brumadinho", state: "MG" }));
  await waitFor(() => expect(document.activeElement?.id).toBe(field("Rua").id));
  await waitFor(() => expect(markers(view.container).length).toBe(2));
  expect(field("Cidade").value).toBe("Brumadinho");
  expect(field("Rua").value).toBe("");
  expect(screen.getByRole("status").textContent).toBe(
    "Encontramos a cidade. Preencha a rua e o bairro.",
  );
});

test("not found and error explain manual entry; not found clears the CEP's fields and focuses Rua", async () => {
  const { harness, user, view } = setup();
  await user.type(field("CEP"), "30130110");
  act(() => harness.resolve("found", afonsoPena));
  await waitFor(() => expect(field("Cidade").value).toBe("Belo Horizonte"));

  await user.click(field("CEP"));
  await user.clear(field("CEP"));
  await user.type(field("CEP"), "99999999");
  act(() => harness.resolve("not-found"));
  await waitFor(() => expect(document.activeElement?.id).toBe(field("Rua").id));
  expect(screen.getByRole("status").textContent).toBe(
    "Não achamos esse CEP. Preencha o endereço abaixo.",
  );
  expect(field("CEP").getAttribute("aria-invalid")).toBe("true");
  expect(field("Rua").value).toBe("");
  expect(field("Cidade").value).toBe("");
  expect(markers(view.container).length).toBe(0);

  await user.click(field("CEP"));
  await user.click(screen.getByRole("button", { name: "Buscar" }));
  act(() => harness.resolve("error"));
  expect(screen.getByRole("status").textContent).toBe(
    "Não deu para buscar agora. Preencha o endereço abaixo ou tente de novo.",
  );
  expect(screen.getByRole("button", { name: "Buscar" })).toBeTruthy();
});

test("never steals focus from outside the CEP field", async () => {
  const { harness, user } = setup();
  await user.type(field("CEP"), "30130110");
  await user.click(field("Complemento"));
  act(() => harness.resolve("found", afonsoPena));
  await waitFor(() => expect(field("Cidade").value).toBe("Belo Horizonte"));
  await new Promise((resolve) => setTimeout(resolve, 300));
  expect(document.activeElement?.id).toBe(field("Complemento").id);
});

test("editing drops the marker and a new CEP re-fills only the unedited fields", async () => {
  const { harness, user, view } = setup();
  await user.type(field("CEP"), "30130110");
  act(() => harness.resolve("found", afonsoPena));
  await waitFor(() => expect(markers(view.container).length).toBe(4));

  await user.clear(field("Bairro"));
  await user.type(field("Bairro"), "Centro Sul");
  expect(markers(view.container).length).toBe(3);
  expect(field("Bairro").getAttribute("aria-describedby")).not.toBeNull();
  expect(screen.queryAllByText("Preenchido pelo CEP").length).toBe(3);

  await user.click(field("CEP"));
  await user.clear(field("CEP"));
  await user.type(field("CEP"), "30140071");
  act(() =>
    harness.resolve("found", {
      street: "Rua da Bahia",
      district: "Lourdes",
      city: "Belo Horizonte",
      state: "MG",
    }),
  );
  await waitFor(() => expect(field("Rua").value).toBe("Rua da Bahia"));
  expect(field("Bairro").value).toBe("Centro Sul");
  await waitFor(() => expect(markers(view.container).length).toBe(3));
});

test("Número is required unless Sem número is checked, with linked inline errors", async () => {
  const { user, view } = setup();
  const form = view.container.querySelector("form") as HTMLFormElement;
  expect(field("Número").getAttribute("aria-required")).toBe("true");
  act(() => {
    form.checkValidity();
  });
  await waitFor(() =>
    expect(screen.getByText('Informe o número ou marque "Sem número".')).toBeTruthy(),
  );
  expect(screen.getByText("Informe a rua.")).toBeTruthy();
  expect(screen.getByText("Informe a cidade.")).toBeTruthy();
  expect(screen.getByText("Escolha a UF.")).toBeTruthy();
  expect(field("Número").getAttribute("aria-invalid")).toBe("true");
  expect(field("Número").getAttribute("aria-describedby")).toContain(
    screen.getByText('Informe o número ou marque "Sem número".').id,
  );

  await user.type(field("Número"), "1500");
  expect(screen.queryByText('Informe o número ou marque "Sem número".') === null).toBe(true);
  await user.click(screen.getByRole("checkbox", { name: "Sem número" }));
  expect(field("Número").disabled).toBe(true);
  expect(field("Número").value).toBe("");
  expect(screen.queryByText('Informe o número ou marque "Sem número".') === null).toBe(true);

  expect(
    getMissingAddressFields({
      ...EMPTY_ADDRESS,
      street: "Avenida Afonso Pena",
      city: "Belo Horizonte",
      state: "MG",
      noNumber: true,
    }),
  ).toEqual([]);
});

test("reduced motion fills every field at once and focuses immediately", async () => {
  reduceMotion();
  const { harness, user, view } = setup();
  await user.type(field("CEP"), "30130110");
  act(() => harness.resolve("found", afonsoPena));
  // Everything lands in one update: no stagger, no wash, focus in the same commit.
  await waitFor(() => expect(field("Rua").value).toBe("Avenida Afonso Pena"));
  expect(field("Cidade").value).toBe("Belo Horizonte");
  expect(document.activeElement?.id).toBe(field("Número").id);
  expect(markers(view.container).length).toBe(4);
  for (const input of markers(view.container)) {
    expect(input.className).not.toContain("_16%");
    expect(input.className).toContain("_5%");
  }
});

test("compact keeps labels for screen readers and uses placeholders; split adds the summary", () => {
  const compact = setup("compact");
  expect(field("Rua").placeholder).toBe("Rua");
  const label = compact.view.container.querySelector(`label[for="${field("Rua").id}"]`);
  expect(label?.className).toContain("sr-only");
  expect(screen.getByRole("button", { name: "Salvar endereço" })).toBeTruthy();
  compact.view.unmount();

  setup("split", {
    cep: "30130110",
    street: "Avenida Afonso Pena",
    number: "1500",
    district: "Centro",
    city: "Belo Horizonte",
    state: "MG",
  });
  const summary = document.querySelector('[data-slot="address-form-summary"]') as HTMLElement;
  expect(summary.textContent).toContain("Entregar em");
  expect(summary.textContent).toContain("Avenida Afonso Pena, 1500");
  expect(summary.textContent).toContain("Belo Horizonte – MG");
  expect(summary.textContent).toContain("CEP 30130-110");
});
