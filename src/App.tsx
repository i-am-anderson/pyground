import { Panel, Group, Separator } from "react-resizable-panels";
import { Analytics } from "@vercel/analytics/react";
import CodeBlock from "./components/CodeBlock";
import FilesTree from "./components/FilesTree";
import Terminal from "./components/Terminal";
import "./App.css";

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#1d1f21" }}>
      {/* Grupo Principal: Horizontal (FilesTree vs Resto) */}
      <Group orientation="horizontal">
        <Panel defaultSize={20} minSize={100}>
          <FilesTree />
        </Panel>

        <Separator />

        <Panel defaultSize={80}>
          <Group orientation="vertical">
            <Panel defaultSize={65} minSize={100}>
              <CodeBlock />
            </Panel>

            <Separator />

            <Panel defaultSize={35} minSize={100}>
              <Terminal />
            </Panel>
          </Group>
        </Panel>
      </Group>
      <Analytics />
    </div>
  );
}

export default App;
