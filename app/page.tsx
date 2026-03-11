import { RepoProps } from "@/actions/getRepoTree";
import Main from "@/components/Main";
import { createHash } from "crypto";
import directoryTree from "directory-tree";
import path from "path";

type ItemProps = {
  path: string;
  type: string;
  size: number;
  children: ItemProps[];
};

type TreeProps = {
  path: string;
  type: "tree" | "blob";
  size: number;
  mode: "040000" | "100644";
  sha: string;
  url: string;
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const c = (await searchParams).c;

  const treeList: TreeProps[] = [];

  const flattenTree = (item: ItemProps) => {
    const sha = createHash("sha1").update(item.path).digest("hex");

    const pathParts = item.path.split(/[\\/]mock[\\/]/);
    const cleanPath =
      pathParts.length > 1 ? pathParts[1] : path.basename(item.path);

    treeList.push({
      path: cleanPath,
      mode: item.type === "directory" ? "040000" : "100644",
      type: item.type === "directory" ? "tree" : "blob",
      size: item.size,
      sha: sha,
      url: `/mock/${cleanPath}`,
    });

    if (item.children) {
      item.children.forEach(flattenTree);
    }
  };

  const mockPath = path.join(process.cwd(), "public", "mock");

  const rawTree = directoryTree(mockPath, {
    attributes: ["size", "type"],
  });

  if (rawTree) {
    flattenTree(rawTree as ItemProps);
  }

  treeList.shift();

  const defaultTree: RepoProps = {
    tree: treeList,
  };

  return <Main defaultTree={defaultTree} c={c === "false" ? false : true} />;
}
