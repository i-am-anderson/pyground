import "./App.css";
import CodeBlock from "./components/CodeBlock";
import FilesTree from "./components/FilesTree";
import Terminal from "./components/Terminal";

function App() {
  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
      }}
    >
      <div style={{ width: "20%", height: "100%" }}>
        <FilesTree />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "80%",
          height: "100%",
        }}
      >
        <div style={{ height: "65%" }}>
          <CodeBlock />
        </div>
        <div style={{ height: "35%" }}>
          <Terminal />
        </div>
      </div>
    </div>
  );
}

export default App;
