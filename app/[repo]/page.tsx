import { RepoProps } from "@/actions/getRepoTree";
import Main from "@/components/Main";
import { createHash } from "crypto";
import directoryTree from "directory-tree";

export default function HomePage() {
  const treeList: any[] = [];

  const flattenTree = (item: any) => {
    const sha = createHash("sha1").update(item.path).digest("hex");

    treeList.push({
      path: item.path.replace("public/mock/", ""),
      mode: item.type === "directory" ? "040000" : "100644",
      type: item.type === "directory" ? "tree" : "blob",
      size: item.size,
      sha: sha,
      url: `/${item.path}`,
    });

    if (item.children) {
      item.children.forEach(flattenTree);
    }
  };

  const rawTree = directoryTree("./public/mock", {
    attributes: ["size", "type"],
  });

  if (rawTree) {
    flattenTree(rawTree);
  }

  treeList.shift();

  const defaultTree: RepoProps = {
    tree: treeList,
  };

  return <Main defaultTree={defaultTree} />;
}
