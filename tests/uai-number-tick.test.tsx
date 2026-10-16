import { expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { NumberTick } from "@/registry/uai/lib/uai-number-tick";

test("renders the plain value at rest and settles on the new value", () => {
  const { container, rerender } = render(
    <p>
      <NumberTick value="$48,290" />
    </p>,
  );
  expect(container.textContent).toBe("$48,290");
  expect(container.querySelector("[data-slot=number-tick]")).toBeNull();
  rerender(
    <p>
      <NumberTick value="$48,310" />
    </p>,
  );
  // Without the Web Animations API (jsdom) the tick resolves at once.
  expect(container.textContent).toBe("$48,310");
  expect(container.querySelector("[data-slot=number-tick]")).toBeNull();
});
