import { useMemo } from "react";
import { Tree } from "react-arborist";
import useResizeObserver from "use-resize-observer";
import useCustomStore from "../../store/useCustomStore";
import useFetch from "../../hooks/useFetch";
import PythonIcon from "../../assets/PythonIcon";
import FileIcon from "../../assets/FileIcon";
import OpenFolderIcon from "../../assets/OpenFolderIcon";
import CloseFolderIcon from "../../assets/CloseFolderIcon";
import BeanEater from "../../assets/beanEater.svg";

type FileTree = {
  id: string;
  name: string;
  url: string;
  children?: FileTree[];
};

type Tree = {
  mode: string;
  path: string;
  sha: string;
  type: string;
  url: string;
  size?: number;
};

type Data = {
  sha: string;
  tree: Tree[];
  url: string;
  truncated: boolean;
};

const FilesTree = () => {
  const { ref, width, height } = useResizeObserver();
  const USER = "i-am-anderson";
  const REPO = "python-exercises-ISO030";
  const BRANCH = "main";
  const addUrl = useCustomStore((state) => state.addUrl);
  const addName = useCustomStore((state) => state.addName);
  const { data, loading, error } = useFetch<Data[]>({
    url: `https://api.github.com/repos/${USER}/${REPO}/git/trees/${BRANCH}?recursive=1`,
  });

  const handleClick = (url: string, name: string) => {
    addName(name);
    addUrl(url);
  };

  const buildTree = (files: Tree[]) => {
    const root: FileTree[] = [];
    const map = { "": { children: root } };

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

  const treeData = useMemo(() => {
    if (!data?.tree) return [];
    const hasREADME = data.tree.find(({ path }) => path === "README.md");
    if (hasREADME) {
      addUrl(hasREADME.url);
    }
    return buildTree(data.tree);
  }, [data]);

  if (loading) return (
    <div style={{display: "flex", height: "100%", justifyContent: "center", alignItems: "center"}}>
      <img src={BeanEater} alt="Loading..." style={{ width: "100px", margin: "20px auto" }} />
    </div>
  );
  if (error) return <p>Error: {error.message}</p>;

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
          padding={10}
        >
          {({ node, style, dragHandle }) => (
            <div style={style} ref={dragHandle} className="node-item">
              <span onClick={() => node.toggle()}>
                {node.isInternal ? (
                  <button>
                    {node.isOpen
                      ? <OpenFolderIcon />
                      : <CloseFolderIcon />}
                    {node.data.name}
                  </button>
                ) : (
                  <button
                    onClick={() => handleClick(node.data.url, node.data.name)}
                  >
                    {node.data.name.endsWith(".py") ? <PythonIcon /> : <FileIcon />}{" "}
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
