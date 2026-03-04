/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import useResizeObserver from "use-resize-observer";
// @ts-ignore
import "xterm/css/xterm.css";
import useCustomStore from "@/store/useCustomStore";

declare global {
  interface Window {
    loadPyodide: () => Promise<any>;
    terminalInput: (message?: string) => Promise<string>;
  }
}

const Terminal = () => {
  const { ref, width, height } = useResizeObserver();
  const codeToRun = useCustomStore((state) => state.code);
  const name = useCustomStore((state) => state.name);

  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const pyodideRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);
  const inputBufferRef = useRef("");
  const inputResolverRef = useRef<((value: string) => void) | null>(null);

  const [isReady, setIsReady] = useState(false);

  // ===============================
  // INICIALIZAÇÃO
  // ===============================
  const formatPrint = (
    term: any,
    status:
      | "LOG"
      | "STARTING"
      | "CRITICAL ERROR"
      | "READY"
      | "LOAD FAILURE"
      | "ATTENTION",
    message: string,
  ) => {
    const color = {
      LOG: "36m",
      STARTING: "33m",
      "CRITICAL ERROR": "31m",
      READY: "32m",
      "LOAD FAILURE": "31m",
      ATTENTION: "33m",
    }[status];

    if (status === "LOG") {
      term.writeln("\r\n\x1b[36m---" + message + "---\x1b[0m");
    } else {
      term.writeln(
        "\r\n\x1b[90m---\x1b[0m \x1b[1;" +
          color +
          status +
          "\x1b[0m \x1b[90m" +
          "-".repeat(40 - status.length) +
          "\x1b[0m",
      );
      term.writeln("\x1b[" + color + "    " + message + "\x1b[0m");
      term.writeln("\x1b[90m" + "-".repeat(45) + "\x1b[0m");
    }
  };

  useEffect(() => {
    if (fitAddonRef.current && xtermRef.current) {
      setTimeout(() => {
        fitAddonRef.current.fit();
      }, 10);
    }
  }, [width, height]);

  useEffect(() => {
    const setupTerminal = async () => {
      const XTermModule = await import("xterm");
      const { FitAddon } = await import("xterm-addon-fit");
      const XTerm = XTermModule.Terminal;

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

      const fitAddon = new FitAddon();
      fitAddonRef.current = fitAddon;
      term.loadAddon(fitAddon);

      xtermRef.current = term;
      if (terminalRef.current) {
        term.open(terminalRef.current);
        fitAddon.fit();
      }

      formatPrint(term, "STARTING", "Inicializando ambiente Python");

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
            formatPrint(term, "CRITICAL ERROR", "CDN do Pyodide não encontrada.");
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
          formatPrint(term, "READY", "Python 3.12 pronto para uso!");
        } catch (err) {
          formatPrint(
            term,
            "LOAD FAILURE",
            (err as Error)?.message ||
              "Erro desconhecido ao carregar o Pyodide.",
          );
        }
      };

      setupPyodide();

      return () => {
        term.dispose();
        xtermRef.current = null;
      };
    };

    setupTerminal();
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
      formatPrint(term, "ATTENTION", "Nenhum código disponível para execução.");
      return;
    }

    formatPrint(term, "LOG", "Início da execução");
    try {
      pyodideRef.current.setStdout({
        batched: (str: string) => term.write(str),
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

      formatPrint(term, "LOG", "Finalizado com sucesso");
    } catch (err) {
      formatPrint(
        term,
        "CRITICAL ERROR",
        (err as Error)?.message || "Erro desconhecido no Python.",
      );
    }
  };

  // ===============================
  // RENDER
  // ===============================
  return (
    <div
      style={{
        overflow: "hidden",
        height: "100%",
        width: "100%",
      }}
      ref={ref}
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
                  ? "#0277BD"
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
