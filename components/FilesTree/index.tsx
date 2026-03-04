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

const FilesTree = () => {
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
    <div
      className="tree-container"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRight: "1px solid #333",
        backgroundColor: "#1d1f21",
      }}
    >
      <div
        style={{
          padding: "8px 15px",
          backgroundColor: "#252525",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #333",
        }}
      >
        <span
          style={{
            color: "#aaa",
            fontSize: "14px",
            fontWeight: "bold",
            padding: "5px 0",
          }}
        >
          Explorer
        </span>
      </div>
      <div
        className="tree-parent"
        style={{ flexGrow: 1, minBlockSize: 0 }}
        ref={ref}
      >
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
            <div style={style} ref={dragHandle} className="node-item">
              <span onClick={() => node.toggle()}>
                {node.isInternal ? (
                  <button>
                    {node.isOpen ? <OpenFolderIcon /> : <CloseFolderIcon />}
                    {node.data.name}
                  </button>
                ) : (
                  <button
                    onClick={() => handleClick(node.data.url, node.data.name)}
                    style={{
                      background: node.data.name === name ? "#333" : "",
                    }}
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
};

export default FilesTree;
