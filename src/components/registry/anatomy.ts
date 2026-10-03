/** `guide` is the tree-drawing prefix, such as "│ └ ", for monospace display. */
export type AnatomyNode = { name: string; depth: number; guide: string };

export type AnatomyModule = { file: string; parts: readonly string[] };

const uaiImportPattern =
  /import\s*\{([^}]*)\}\s*from\s*"@\/components\/(?:ui\/)?uai\/([a-z0-9-]+)"/g;

/** Named Uai parts imported by a usage example, grouped by source file. */
export function getAnatomyModules(usage: string): AnatomyModule[] {
  return [...usage.matchAll(uaiImportPattern)].map(([, names = "", file = ""]) => ({
    file: `${file}.tsx`,
    parts: names
      .split(",")
      .map((name) => name.trim())
      .filter((name) => /^[A-Z][a-z]/.test(name)),
  }));
}

/**
 * The JSX nesting of Uai parts in a usage example. Depth comes from indentation
 * relative to enclosing Uai parts, so wrapper elements do not add levels. Each
 * part appears once, at its first position.
 */
export function getAnatomyTree(usage: string): AnatomyNode[] {
  const parts = new Set(getAnatomyModules(usage).flatMap((module) => module.parts));
  const ancestors: number[] = [];
  const seen = new Set<string>();
  const nodes: Omit<AnatomyNode, "guide">[] = [];

  for (const line of usage.split("\n")) {
    const match = /^(\s*)<([A-Z][A-Za-z]*)/.exec(line);
    const indent = match?.[1]?.length ?? 0;
    const name = match?.[2];
    if (!name || !parts.has(name)) continue;

    while (ancestors.length > 0 && (ancestors.at(-1) ?? 0) >= indent) ancestors.pop();
    if (!seen.has(name)) {
      seen.add(name);
      nodes.push({ name, depth: ancestors.length });
    }
    ancestors.push(indent);
  }

  const hasLaterSibling = (index: number, depth: number) => {
    for (const node of nodes.slice(index + 1)) {
      if (node.depth < depth) return false;
      if (node.depth === depth) return true;
    }
    return false;
  };

  return nodes.map((node, index) => {
    let guide = "";
    for (let level = 1; level < node.depth; level += 1) {
      guide += hasLaterSibling(index, level) ? "│ " : "  ";
    }
    if (node.depth > 0) guide += hasLaterSibling(index, node.depth) ? "├ " : "└ ";
    return { ...node, guide };
  });
}
