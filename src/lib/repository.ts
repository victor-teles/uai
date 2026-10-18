/** The public GitHub repository. Kept apart from `site.ts` so client components can import it without bundling `registry.json`. */
export const repositoryUrl = "https://github.com/victor-teles/uai";

/** Repository path of a registry item's source file, such as `src/registry/uai/blocks/agent-run.tsx`. */
export function registrySourcePath(id: string, kind: "component" | "block") {
  return `src/registry/uai/${kind === "block" ? "blocks" : "components"}/${id}.tsx`;
}

/** GitHub URL of a registry item's source file on `main`. */
export function registrySourceUrl(id: string, kind: "component" | "block") {
  return `${repositoryUrl}/blob/main/${registrySourcePath(id, kind)}`;
}
