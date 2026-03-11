"use client";

import { useEffect, useState } from "react";
import { Tree } from "react-arborist";
import useResizeObserver from "use-resize-observer";
import useCustomStore from "@/store/useCustomStore";
import OpenFolderIcon from "@/assets/OpenFolderIcon";
import CloseFolderIcon from "@/assets/CloseFolderIcon";
import { getRepoTreeAction, RepoProps, TreeProps } from "@/actions/getRepoTree";
import Loading from "@/components/Loading";
import FileIcon from "../FileIcon";
import { useParams } from "next/navigation";

type FileTree = {
  id: string;
  name: string;
  url: string;
  children?: FileTree[];
};

export default function FilesTree({ defaultTree }: { defaultTree: RepoProps }) {
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
    // Guarda referências de pastas para não precisar procurá-las manualmente
    const folderCache = new Map<string, FileTree>();

    files.forEach((file) => {
      /**
       * ENTRA: file.path (ex: "public\\mock\\pasta\\video.mp4")
       * Substitui barras invertidas e remove o prefixo fixo.
       * SAI: ["pasta", "video.mp4"] (Array de strings limpo)
       */
      const parts = file.path
        .replace(/\\/g, "/")
        .replace("public/mock/", "")
        .split("/");

      // Reseta o ponteiro para o topo da árvore a cada novo arquivo
      let currentLevel = root;
      let fullPath = "";

      parts.forEach((part, index) => {
        const isLastPart = index === parts.length - 1;

        /**
         * ENTRA: part (ex: "pasta")
         * Acumula o nome para criar uma chave única.
         * SAI: fullPath (ex: "pasta" na 1ª volta, "pasta/sub" na 2ª)
         */
        fullPath += (fullPath ? "/" : "") + part;

        /**
         * ENTRA: fullPath (Chave do Map)
         * O Map verifica se já existe um objeto na memória para este caminho.
         * SAI: existingNode (O objeto FileTree encontrado ou undefined)
         */
        let existingNode = folderCache.get(fullPath);

        if (!existingNode) {
          /**
           * ENTRA: Dados brutos do arquivo original (file.sha, file.url, etc)
           * Cria um objeto FileTree. Define se ele terá um array 'children' vazio.
           * SAI: newNode (Um novo objeto estruturado na memória)
           */
          const isFolder = file.type === "tree" || !isLastPart;

          const newNode: FileTree = {
            id: `${file.sha}-${index}`,
            name: part,
            url: isLastPart ? file.url : "",
            ...(isFolder ? { children: [] } : {}),
          };

          // Adiciona o objeto ao nível atual da árvore (referência de memória)
          currentLevel.push(newNode);
          existingNode = newNode;

          /**
           * ENTRA: newNode
           * Salva a referência no Map para que o próximo arquivo saiba que essa pasta já existe.
           * SAI: Map atualizado.
           */
          if (isFolder) {
            folderCache.set(fullPath, newNode);
          }
        }

        /**
         * ENTRA: existingNode.children
         * Altera o ponteiro 'currentLevel' para apontar para dentro da pasta atual.
         * SAI: A próxima 'part' do loop será inserida dentro deste array.
         */
        if (existingNode.children) {
          currentLevel = existingNode.children;
        }
      });
    });

    const sortTree = (nodes: FileTree[]) => {
      nodes.sort((a, b) => {
        const aIsFolder = !!a.children;
        const bIsFolder = !!b.children;

        if (aIsFolder && !bIsFolder) return -1;
        if (!aIsFolder && bIsFolder) return 1;

        return a.name.localeCompare(b.name);
      });

      nodes.forEach((node) => {
        if (node.children) {
          sortTree(node.children);
        }
      });
    };

    sortTree(root);

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
          addName("README.md");
          setTreeData(buildTree(defaultTree.tree));
          addUrl("/public/mock/README.md");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addUrl]);

  if (loading) return <Loading />;
  return (
    <div className="flex flex-col h-full border-r border-[#333] bg-transparent">
      <div className="py-2 px-3.75 bg-[#252525] flex justify-between items-center border-b border-[#333]">
        <span className="text-[#aaa] text-sm font-bold py-1">Explorer</span>
      </div>
      <div className="grow min-[block-size-0]" ref={ref}>
        <Tree
          initialData={treeData}
          openByDefault={false}
          width={width}
          height={height}
          indent={20}
          rowHeight={38}
          paddingBottom={5}
        >
          {({ node, style }) => (
            <div
              style={style}
              className={`border border-transparent ${node.data.name === name ? "bg-[#33333380]" : "bg-transparent hover:bg-[#0277bd80]"} cursor-pointer hover:border-[#0277bd] transition-all duration-250`}
            >
              <span onClick={() => node.toggle()}>
                {node.isInternal ? (
                  <button
                    className={`flex items-center gap-2.5 px-5 py-1.5 text-sm font-normal font-inherit w-full text-center whitespace-nowrap text-white focus:outline-none cursor-pointer`}
                  >
                    {node.isOpen ? <OpenFolderIcon /> : <CloseFolderIcon />}
                    {node.data.name}
                  </button>
                ) : (
                  <button
                    onClick={() => handleClick(node.data.url, node.data.name)}
                    className={`flex items-center gap-2.5 border border-transparent px-5 py-1.5 text-sm font-normal font-inherit transition-all duration-250 w-full text-center whitespace-nowrap text-white focus:outline-none cursor-pointer`}
                  >
                    <FileIcon filename={node.data.name} />
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