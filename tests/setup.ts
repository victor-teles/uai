import { afterEach } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

// Imported after registration: Testing Library needs a document at load time.
const { cleanup } = await import("@testing-library/react");

// Radix primitives (Select, DropdownMenu, Popover) call pointer-capture and scroll APIs
// that happy-dom does not implement.
const elementPrototype = window.Element.prototype as Element & Record<string, unknown>;
elementPrototype.hasPointerCapture ??= () => false;
elementPrototype.setPointerCapture ??= () => {};
elementPrototype.releasePointerCapture ??= () => {};
elementPrototype.scrollIntoView ??= () => {};

afterEach(() => {
  // Unmount first so Radix modals release the body (`pointer-events: none`, scroll lock).
  cleanup();
  document.body.innerHTML = "";
  document.body.removeAttribute("style");
});
