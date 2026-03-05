"use client";

import { useEffect, useState } from "react";
import { Tree } from "react-arborist";
import useResizeObserver from "use-resize-observer";
import useCustomStore from "@/store/useCustomStore";
import OpenFolderIcon from "@/assets/OpenFolderIcon";
import CloseFolderIcon from "@/assets/CloseFolderIcon";
import { getRepoTreeAction, TreeProps } from "@/actions/getRepoTree";
import Loading from "@/components/Loading";
import FileIcon from "../FileIcon";
import FourOFourIcon from "@/assets/FourOFourIcon";
import { useParams } from "next/navigation";

type FileTree = {
  id: string;
  name: string;
  url: string;
  children?: FileTree[];
};

export default function FilesTree() {
  const params = useParams();
  const repo = (params?.repo as string) || "";
  const branch = (params?.branch as string) || "main";
  const { ref, width, height } = useResizeObserver();
  const addUrl = useCustomStore((state) => state.addUrl);
  const addName = useCustomStore((state) => state.addName);
  const name = useCustomStore((state) => state.name);
  const [treeData, setTreeData] = useState<FileTree[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = (url: string, name: string) => {
    addName(name);
    addUrl(url);
  };

  const buildTree = (files: TreeProps[]) => {
    const root: FileTree[] = [];
    const map: { [key: string]: any } = { "": { children: root } };

    files.forEach((file) => {
      const parts = file.path.split("/");
      let currentPath = "";

      parts.forEach((part, index) => {
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!map[currentPath]) {
          const newNode = {
            id: file.sha + index, // ID único
            name: part,
            ...(file.type === "tree" || index < parts.length - 1
              ? { children: [] }
              : {}),
            url: file.url,
          };
          map[currentPath] = newNode;
          map[parentPath].children.push(newNode);
        }
      });
    });

    return root;
  };

  useEffect(() => {
    const fetchTreeData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getRepoTreeAction({
          repo,
          branch,
        });

        if (!result.success) {
          setError(result.error || "Erro desconhecido");
          // Fallback default
          setTreeData([{ id: "fourOfour", name: "fourOfour.md", url: "" }]);
          addName("fourOfour.md");
          return;
        }

        if (result.data?.tree) {
          const tree = result.data.tree;

          // Lógica do README
          const hasREADME = tree.find((file) => file.path === "README.md");
          if (hasREADME) addUrl(hasREADME.url);
          addName("README.md");
          setTreeData(buildTree(tree));
        }
      } catch (err) {
        setError("Erro crítico ao carregar os arquivos.");
      } finally {
        setLoading(false);
      }
    };

    fetchTreeData();
  }, [addUrl]);

  if (loading) return <Loading />;
  return (
    <div className="flex flex-col h-full border-r border-[#333] bg-[#1d1f21]">
      <div className="py-2 px-3.75 bg-[#252525] flex justify-between items-center border-b border-[#333]">
        <span className="text-[#aaa] text-base font-bold py-1.25">
          Explorer
        </span>
      </div>
      <div className="grow min-[block-size-0]" ref={ref}>
        <Tree
          initialData={treeData}
          openByDefault={false}
          width={width}
          height={height}
          indent={20}
          rowHeight={35}
          paddingBottom={5}
        >
          {({ node, style, dragHandle }) => (
            <div
              style={style}
              ref={dragHandle}
              className={`border border-transparent ${node.data.name === name ? "bg-[#333]" : "bg-transparent hover:bg-[#0277bd90]"} cursor-pointer hover:border-[#0277bd] transition-all duration-250`}
            >
              <span onClick={() => node.toggle()}>
                {node.isInternal ? (
                  <button
                    className={`flex items-center gap-2.5 px-5 py-1.5 text-sm font-normal font-inherit w-full text-center whitespace-nowrap text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 cursor-pointer`}
                  >
                    {node.isOpen ? <OpenFolderIcon /> : <CloseFolderIcon />}
                    {node.data.name}
                  </button>
                ) : (
                  <button
                    onClick={() => handleClick(node.data.url, node.data.name)}
                    className={`flex items-center gap-2.5 border border-transparent px-5 py-1.5 text-sm font-normal font-inherit transition-all duration-250 w-full text-center whitespace-nowrap text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 cursor-pointer`}
                  >
                    {node.data.name === "fourOfour.md" ? (
                      <FourOFourIcon />
                    ) : (
                      <FileIcon filename={node.data.name} />
                    )}
                    {node.data.name}
                  </button>
                )}
              </span>
            </div>
          )}
        </Tree>
      </div>
    </div>
  );
}
