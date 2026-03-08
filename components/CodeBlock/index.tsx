"use client";

import useCustomStore from "@/store/useCustomStore";
import base64Decoded from "@/utils/base64Decoded";
import { useEffect, useState } from "react";
import { getRepoFileAction } from "@/actions/getRepoFile";
import Loading from "@/components/Loading";
import { Editor } from "@monaco-editor/react";
import extensionToLangName from "@/utils/extensionToLangName";

export default function CodeBlock() {
  const url = useCustomStore((state) => state.url);
  const name = useCustomStore((state) => state.name);
  const addCode = useCustomStore((state) => state.addCode);
  const code = useCustomStore((state) => state.code);
  const [loading, setLoading] = useState(false);
  const [extension, setExtension] = useState<string>("javascript");
  const [error, setError] = useState<string | null>(null);

  const handleChange = (value: string | undefined) => {
    addCode(value || "");
  };

  useEffect(() => {
    if (!url) return;

    const fetchTreeData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (url.includes("https://")) {
          const result = await getRepoFileAction({
            url,
          });

          if (!result.success) {
            setError(result.error || "Erro desconhecido");
            return;
          }

          if (result.data?.content) {
            const langExt = name.split(".").pop() || "javascript";
            setExtension(langExt);
            addCode(base64Decoded(result.data.content || ""));
          }
        } else {
          const result = await fetch(url.replace("/public", ""));

          if (!result) {
            setError("Erro desconhecido");
            return;
          }

          const text = await result.text();

          if (text) {
            const langExt = name.split(".").pop() || "javascript";
            setExtension(langExt);
            addCode(text);
          }
        }
      } catch (err) {
        setError("Erro crítico ao carregar os arquivos.");
      } finally {
        setLoading(false);
      }
    };

    fetchTreeData();
  }, [url]);

  if (loading) return <Loading />;
  return (
    <Editor
      height="100%"
      defaultLanguage="python"
      language={extensionToLangName(extension)}
      onChange={handleChange}
      value={code && !error ? code : ""}
      theme="vs-dark"
      loading={<Loading />}
      options={{
        minimap: {
          enabled: false,
        },
        stickyScroll: {
          enabled: false,
        },
        wordWrap: "on",
        fontSize: 14,
        fontLigatures: true,
        lineHeight: 22,
        tabSize: 2,
        fontFamily: "Fira Code Medium, JetBrains Mono Medium, monospace",
        tabCompletion: "on",
        padding: {
          top: 10,
        },
        scrollbar: {
          vertical: "visible",
          verticalScrollbarSize: 10,
          verticalSliderSize: 10,
        },
      }}
    />
  );
}
