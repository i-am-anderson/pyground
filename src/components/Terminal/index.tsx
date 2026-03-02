import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "xterm";
import "xterm/css/xterm.css";
import useCustomStore from "../../store/useCustomStore";

const Terminal = () => {
  const codeToRun = useCustomStore((state) => state.code);
  const name = useCustomStore((state) => state.name);

  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const pyodideRef = useRef(null);

  const inputBufferRef = useRef("");
  const inputResolverRef = useRef(null);

  const [isReady, setIsReady] = useState(false);

  // ===============================
  // INICIALIZAÇÃO
  // ===============================
  useEffect(() => {
    if (xtermRef.current) return; // evita dupla execução

    const term = new XTerm({
      cursorBlink: true,
      theme: {
        background: "#1d1f21",
        foreground: "#f0f0f0",
      },
      rows: 15,
      convertEol: true,
      lineHeight: 1.3,
      
    });

    xtermRef.current = term;
    term.open(terminalRef.current);

    term.writeln("\n\x1b[33m🚀  Inicializando ambiente Python...\x1b[0m");

    // ======================================
    // CAPTURA DE INPUT DO TECLADO
    // ======================================
    term.onData((data) => {
      if (!inputResolverRef.current) return;

      switch (data) {
        case "\r": // ENTER
          term.write("\r\n");
          inputResolverRef.current(inputBufferRef.current);
          inputResolverRef.current = null;
          inputBufferRef.current = "";
          break;

        case "\u007f": // BACKSPACE
          if (inputBufferRef.current.length > 0) {
            inputBufferRef.current = inputBufferRef.current.slice(0, -1);
            term.write("\b \b");
          }
          break;

        default:
          inputBufferRef.current += data;
          term.write(data);
      }
    });

    const setupPyodide = async () => {
      try {
        if (!window.loadPyodide) {
          term.writeln("\x1b[31m❌  CDN do Pyodide não encontrada.\x1b[0m");
          return;
        }

        pyodideRef.current = await window.loadPyodide();

        // Função JS acessível no Python
        window.terminalInput = (message) => {
          return new Promise((resolve) => {
            if (message) term.write(message);
            inputResolverRef.current = resolve;
          });
        };

        // Substitui input() do Python
        await pyodideRef.current.runPythonAsync(`
import builtins
from js import terminalInput

async def custom_input(message=""):
    return await terminalInput(message)

builtins.input = custom_input
        `);

        setIsReady(true);
        term.writeln("\x1b[32m✅  Python 3.12 pronto!\x1b[0m");
      } catch (err) {
        term.writeln(
          "\\x1b[31m❌  Erro ao carregar Pyodide: " + err.message + "\\x1b[0m",
        );
      }
    };

    setupPyodide();

    return () => {
      term.dispose();
      xtermRef.current = null;
    };
  }, []);

  // ===============================
  // EXECUÇÃO DO CÓDIGO
  // ===============================
  const runPython = async () => {
    const term = xtermRef.current;

    if (!term) return;

    term.clear();
    term.focus();

    if (!pyodideRef.current || !codeToRun) {
      term.writeln("\x1b[31m⚠️  Nenhum código disponível.\x1b[0m");
      return;
    }

    term.writeln("\r\n\x1b[36m--- Início da execução ---\x1b[0m");

    try {
      pyodideRef.current.setStdout({
        batched: (str) => term.write(str),
      });

      const cleanCode = codeToRun
        .trim()
        // adiciona await antes de input(
        .replace(/(^|[^a-zA-Z0-9_])input\s*\(/g, "$1await input(");

      const wrappedCode = `
async def __main__():
${cleanCode
  .split("\n")
  .map((line) => "    " + line)
  .join("\n")}

await __main__()
`;

      await pyodideRef.current.runPythonAsync(wrappedCode);

      term.writeln("\x1b[32m\r\n--- Finalizado com sucesso ---\x1b[0m");
    } catch (err) {
      term.writeln("\x1b[31m\r\nPython Error:\r\n" + err.message + "\x1b[0m");
    }
  };

  // ===============================
  // RENDER
  // ===============================
  return (
    <div
      style={{
        // border: "1px solid #333",
        // borderRadius: "8px",
        overflow: "hidden",
        height: "100%",
        width: "100%",
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
          borderTop: "1px solid #333",
        }}
      >
        <span
          style={{
            color: "#aaa",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          Console Python
        </span>

        <button
          onClick={runPython}
          disabled={!isReady || !codeToRun || !name.includes(".py")}
          style={{
            backgroundColor:
              isReady && codeToRun
                ? name.includes(".py")
                  ? "#646cff"
                  : "#f435"
                : "#555",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "6px 20px",
            cursor:
              isReady && codeToRun
                ? name.includes(".py")
                  ? "pointer"
                  : "not-allowed"
                : "not-allowed",
            fontWeight: "bold",
            width: "auto",
          }}
        >
          {isReady
            ? name.includes(".py")
              ? "▶ RUN"
              : "STAND BY"
            : "CARREGANDO..."}
        </button>
      </div>

      <div
        ref={terminalRef}
        style={{
          width: "100%",
          height: "calc(100% - 50px)",
          paddingLeft: "10px",
          backgroundColor: "#1d1f21",
        }}
      />
    </div>
  );
};

export default Terminal;
