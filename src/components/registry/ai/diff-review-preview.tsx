"use client";

import { useState } from "react";
import {
  DiffReview,
  DiffReviewFile,
  type DiffReviewFileData,
  DiffReviewFileHeader,
  DiffReviewFileList,
  DiffReviewFooter,
  DiffReviewHunks,
  DiffReviewStale,
  type DiffReviewValue,
  type DiffReviewVariant,
} from "@/components/ui/uai/diff-review";

// Parse your agent's edit with whatever you already use (or diffReviewFilesFromPatch).
const files: DiffReviewFileData[] = [
  {
    path: "src/lib/pricing.ts",
    hunks: [
      {
        id: "pricing-1",
        header: "export function totalFor(cart)",
        oldStart: 12,
        newStart: 12,
        lines: [
          { kind: "context", content: "export function totalFor(cart: Cart) {" },
          { kind: "del", content: "  const subtotal = sum(cart.items.map((i) => i.price));" },
          { kind: "add", content: "  const subtotal = sum(cart.items, lineTotal);" },
          { kind: "add", content: "  const discount = applyCoupon(subtotal, cart.coupon);" },
          { kind: "context", content: "  const shipping = shippingFor(cart);" },
        ],
      },
      {
        id: "pricing-2",
        oldStart: 19,
        newStart: 22,
        lines: [
          { kind: "del", content: "  return subtotal + shipping;" },
          { kind: "add", content: "  return Math.max(0, subtotal - discount + shipping);" },
          { kind: "add", content: "}" },
          { kind: "add", content: "" },
          { kind: "add", content: "const lineTotal = (i: Item) => i.price * i.qty;" },
        ],
      },
    ],
  },
  {
    path: "src/app/cart/page.tsx",
    hunks: [
      {
        id: "cart-1",
        header: "export default function CartPage()",
        oldStart: 8,
        newStart: 8,
        lines: [
          { kind: "context", content: "  const cart = useCart();" },
          { kind: "del", content: "  const total = cart.total;" },
          { kind: "add", content: "  const total = totalFor(cart);" },
          {
            kind: "add",
            content: '  const saved = cart.coupon ? formatPrice(total.discount) : "";',
          },
          { kind: "context", content: "  return (" },
        ],
      },
    ],
  },
  {
    path: "src/lib/coupons.ts",
    hunks: [
      {
        id: "coupons-1",
        header: "export function applyCoupon(subtotal, code)",
        oldStart: 4,
        newStart: 4,
        lines: [
          {
            kind: "context",
            content: "export function applyCoupon(subtotal: number, code?: string) {",
          },
          { kind: "del", content: "  if (!code) return subtotal;" },
          { kind: "add", content: "  if (!code) return 0;" },
          { kind: "add", content: "  const rate = rates[code.toUpperCase()] ?? 0;" },
          { kind: "add", content: "  return Math.round(subtotal * rate);" },
        ],
      },
    ],
  },
  {
    path: "tests/pricing.test.ts",
    hunks: [
      {
        id: "tests-1",
        oldStart: 30,
        newStart: 30,
        lines: [
          { kind: "context", content: '  it("adds shipping", () => {' },
          { kind: "add", content: "    expect(totalFor(cartWithCoupon)).toBe(4180);" },
          { kind: "add", content: "    expect(totalFor(emptyCart)).toBe(0);" },
          { kind: "context", content: "  });" },
        ],
      },
    ],
  },
];

export function DiffReviewPreview({ variant = "unified" }: { variant?: DiffReviewVariant }) {
  const [value, setValue] = useState<DiffReviewValue>({ "tests-1": "rejected" });
  const [applied, setApplied] = useState(false);

  return (
    <DiffReview
      variant={variant}
      files={files}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        setApplied(false);
      }}
      stale={["src/lib/coupons.ts"]}
      applied={applied}
      onApply={() => setApplied(true)}
    >
      {variant === "compact" ? (
        <DiffReviewFileList />
      ) : (
        files.map((file) => (
          <DiffReviewFile
            key={file.path}
            path={file.path}
            defaultOpen={file.path !== "tests/pricing.test.ts"}
          >
            <DiffReviewFileHeader />
            <DiffReviewStale />
            <DiffReviewHunks />
          </DiffReviewFile>
        ))
      )}
      <DiffReviewFooter />
    </DiffReview>
  );
}
