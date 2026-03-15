/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import useResizeObserver from "use-resize-observer";
// @ts-ignore
import "@xterm/xterm/css/xterm.css";
import useCustomStore from "@/store/useCustomStore";

declare global {
  interface Window {
    loadPyodide: () => Promise<any>;
    terminalInput: (message?: string) => Promise<string>;
  }
}

export default function Terminal() {
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

  const formatPrint = (
    term: any,
    status: "LOG" | "STARTING" | "CRITICAL ERROR" | "READY" | "LOAD FAILURE" | "ATTENTION",
    message: string,
    enter?: "init" | "final",
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
      term.writeln(
        (enter === "init" ? "\n" : "") +
          "\r\n\x1b[" + color + "--- " + message + " ---\x1b[0m" +
          (enter === "final" ? "\n" : ""),
      );
    } else {
      term.writeln("\r\n\x1b[90m---\x1b[0m \x1b[1;" + color + status + "\x1b[0m \x1b[90m" + "-".repeat(40 - status.length) + "\x1b[0m");
      term.writeln("\x1b[" + color + "    " + message + "\x1b[0m");
      term.writeln("\x1b[90m" + "-".repeat(45) + "\x1b[0m");
    }
  };

  useEffect(() => {
    if (fitAddonRef.current && xtermRef.current) {
      setTimeout(() => fitAddonRef.current.fit(), 10);
    }
  }, [width, height]);

  useEffect(() => {
    const setupTerminal = async () => {
      const XTermModule = await import("@xterm/xterm");
      const { FitAddon } = await import("@xterm/addon-fit");
      const XTerm = XTermModule.Terminal;

      if (xtermRef.current) return;

      const term = new XTerm({
        cursorBlink: true,
        theme: { background: "#1d1f21", foreground: "#f0f0f0" },
        rows: 15,
        convertEol: true,
        lineHeight: 1.3,
        fontSize: 14,
      });

      const fitAddon = new FitAddon();
      fitAddonRef.current = fitAddon;
      term.loadAddon(fitAddon);
      xtermRef.current = term;

      if (terminalRef.current) {
        term.open(terminalRef.current);
        fitAddon.fit();
      }

      formatPrint(term, "STARTING", "Initializing the Python environment");

      term.onData((data) => {
        if (!inputResolverRef.current) return;
        switch (data) {
          case "\r":
            term.write("\r\n");
            inputResolverRef.current(inputBufferRef.current);
            inputResolverRef.current = null;
            inputBufferRef.current = "";
            break;
          case "\u007f":
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
            formatPrint(term, "CRITICAL ERROR", "Pyodide CDN not found");
            return;
          }

          pyodideRef.current = await window.loadPyodide();

          window.terminalInput = (message) => {
            return new Promise((resolve) => {
              if (message) term.write(message);
              inputResolverRef.current = resolve;
            });
          };

          // INJEÇÃO DO CUSTOM PRINT E INPUT
          await pyodideRef.current.runPythonAsync(`
import builtins
from js import terminalInput

async def custom_input(message=""):
    return await terminalInput(message)

def custom_print(*args, **kwargs):
    # Força o flush=True para que o texto saia imediatamente
    kwargs.setdefault('flush', True)
    return builtins._old_print(*args, **kwargs)

# Faz o backup do print original se ainda não foi feito
if not hasattr(builtins, '_old_print'):
    builtins._old_print = builtins.print

builtins.print = custom_print
builtins.input = custom_input
          `);

          setIsReady(true);
          formatPrint(term, "READY", "Python is ready to use.");
        } catch (err) {
          formatPrint(term, "LOAD FAILURE", (err as Error)?.message || "Error loading Pyodide.");
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

  const runPython = async () => {
    const term = xtermRef.current;
    if (!term || !pyodideRef.current || !codeToRun) return;

    term.clear();
    term.focus();

    formatPrint(term, "LOG", "Start of execution", "final");
    try {
      // CONFIGURAÇÃO DE SAÍDA EM TEMPO REAL (RAW)
      pyodideRef.current.setStdout({
        write: (buffer: Uint8Array) => {
          const decoder = new TextDecoder("utf-8");
          term.write(decoder.decode(buffer));
          return buffer.length;
        },
      });

      const cleanCode = codeToRun
        .trim()
        .replace(/(^|[^a-zA-Z0-9_])input\s*\(/g, "$1await input(");

      const wrappedCode = `
async def __main__():
${cleanCode.split("\n").map((line) => "    " + line).join("\n")}

await __main__()
`;

      await pyodideRef.current.runPythonAsync(wrappedCode);
      formatPrint(term, "LOG", "Completed successfully", "init");
    } catch (err) {
      formatPrint(term, "CRITICAL ERROR", (err as Error)?.message || "Python error");
    }
  };

  return (
    <div className="overflow-hidden h-full w-full" ref={ref}>
      <div className="py-1.25 px-3.75 bg-[#252525] flex justify-between items-center border-b border-t border-[#333]">
        <span className="text-[#aaa] text-sm font-bold">Console Python</span>
        <button
          onClick={runPython}
          disabled={!isReady || !codeToRun || !name.includes(".py")}
          className={`flex items-center gap-2.5 border border-transparent px-5 py-1 text-sm font-bold font-inherit transition-all duration-250 w-auto text-center whitespace-nowrap rounded-sm text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 ${isReady && codeToRun && name.includes(".py") ? "bg-[#0277BD] cursor-pointer hover:bg-[#0277bd90] hover:border-[#0277bd]" : "bg-[#555] cursor-not-allowed"}`}
        >
          {isReady ? (name.includes(".py") ? "▶ RUN" : "STAND BY") : "CARREGANDO..."}
        </button>
      </div>
      <div ref={terminalRef} className="w-full h-[calc(100%-50px)] pl-2.5" />
    </div>
  );
}