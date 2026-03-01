import { Panel, Group, Separator } from "react-resizable-panels";
import CodeBlock from "./components/CodeBlock";
import FilesTree from "./components/FilesTree";
import Terminal from "./components/Terminal";

// Um componente simples para a barra de arraste
const ResizeHandle = ({ className = "" }) => (
  <Separator
    className={`w-1 bg-slate-800 hover:bg-blue-500 transition-colors ${className}`}
  />
);

const ResizeHandleHorizontal = () => (
  <Separator
    className="h-1 bg-slate-800 hover:bg-blue-500 transition-colors"
  />
);

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0f172a" }}>
      {/* Grupo Principal: Horizontal (FilesTree vs Resto) */}
      <Group orientation="horizontal">
        
        {/* Lado Esquerdo: FilesTree */}
        <Panel defaultSize={20} minSize={10}>
          <FilesTree />
        </Panel>

        <ResizeHandle />

        {/* Lado Direito: Grupo Vertical (Code + Terminal) */}
        <Panel defaultSize={80}>
          <Group orientation="vertical">
            
            <Panel defaultSize={65} minSize={20}>
              <CodeBlock />
            </Panel>

            <ResizeHandleHorizontal />

            <Panel defaultSize={35} minSize={10}>
              <Terminal />
            </Panel>

          </Group>
        </Panel>

      </Group>
    </div>
  );
}

export default App;