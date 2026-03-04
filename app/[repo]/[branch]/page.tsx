"use client";

import dynamic from "next/dynamic";
import { Panel, Group, Separator } from "react-resizable-panels";
import CodeBlock from "@/components/CodeBlock";
import FilesTree from "@/components/FilesTree";
import Loading from "@/components/Loading";

export default function Home() {
  const Terminal = dynamic(() => import("@/components/Terminal"), {
    ssr: false,
    loading: () => <Loading />,
  });

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#1d1f21" }}>
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
    </div>
  );
}
