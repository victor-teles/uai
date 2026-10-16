# Quality

`premium-rubric.md` in this folder is the quality bar for every distributed Uai item.
It is written and owned by Designer; engineering only implements its checks.

It is read by:

- `scripts/design-review.ts`, which scores Playwright screenshots 1–10 against it
  (and exits with an error if this file is missing), and
- `.github/workflows/polish-loop.yml`, which runs that review weekly.

To change the rubric, ask Designer for a new version rather than editing it here.
