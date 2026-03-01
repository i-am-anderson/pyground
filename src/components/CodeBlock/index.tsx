import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import useCustomStore from "../../store/useCustomStore";
import useFetch from "../../hooks/useFetch";
import base64Decoded from "../../utils/base64Decoded";
import { useEffect, useState } from "react";

type CodeFile = {
  content: string;
  enconding: string;
  node_id: string;
  sha: string;
  size: number;
  url: string;
};

const CodeBlock = () => {
  const [extension, setExtension] = useState<string>("javascript");
  const url = useCustomStore((state) => state.url);
  const name = useCustomStore((state) => state.name);
  const addCode = useCustomStore((state) => state.addCode);
  const { data, loading, error } = useFetch<CodeFile>({
    url: url,
  });

  useEffect(() => {
    if (!data) return;
    const extensionMatch = name.match(/\.([a-z0-9]+)$/i);
    const langExt = extensionMatch ? extensionMatch[1] : "javascript";
    setExtension(langExt);
    addCode(base64Decoded(data.content || ""));
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  return (
    <SyntaxHighlighter
      language={extension}
      style={atomDark}
      showLineNumbers={true}
      wrapLines={true}
      lineProps={{ style: { wordBreak: "break-word", whiteSpace: "pre-wrap" } }}
      customStyle={{
        height: "100%",
        padding: 0,
        margin: 0,
        borderRadius: 0,
        paddingTop: "10px",
        paddingBottom: "20px",
        paddingLeft: "10px",
        paddingRight: "10px",
      }}
    >
      {data ? base64Decoded(data.content || "") : "No code to display"}
    </SyntaxHighlighter>
  );
};

export default CodeBlock;
