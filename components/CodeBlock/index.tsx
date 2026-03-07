import useCustomStore from "@/store/useCustomStore";
import base64Decoded from "@/utils/base64Decoded";
import { useEffect, useState } from "react";
import { FileProps, getRepoFileAction } from "@/actions/getRepoFile";
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

  const errorText =
    "📋 O Mural de 'Ops!' (ou o que pode ter acontecido)\n\nAté os melhores sistemas têm seus dias de 'segunda-feira', e aqui estão os suspeitos de costume:\n\n- 🕵️‍♂️ O Repositório Invisível: Sabe quando você esquece onde deixou a chave? O app não achou o repositório. Pode ser um erro de digitação ou ele foi deletado.\n\n- 🔐 'Só Entra com Convite': O repositório é privado! Ele é mais fechado que cofre de banco e, sem a chave certa, não conseguimos ler nada.\n\n- 🚦 Calma lá, Flash!: Você atingiu o 'Rate Limit'. A internet pediu para você dar uma segurada, tomar um café e voltar daqui a pouco.\n\n- 🌀 O Abismo do Desconhecido: Algum erro misterioso aconteceu. Pode ser o Wi-Fi soluçando ou um servidor tropeçando nos cabos.\n\n💡 Dica: Tente atualizar a página ou verificar sua conexão. Se nada resolver, o jeito é respirar fundo e tentar de novo em instantes!";

  const handleChange = (value: string | undefined) => {
    addCode(value || "");
  };

  useEffect(() => {
    if (!url) return;

    const fetchTreeData = async () => {
      try {
        setLoading(true);
        setError(null);

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
      value={code && !error ? code : errorText}
      defaultValue={errorText}
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
