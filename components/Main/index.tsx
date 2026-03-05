"use client";

import dynamic from "next/dynamic";
import { Panel, Group, Separator } from "react-resizable-panels";
import CodeBlock from "@/components/CodeBlock";
import FilesTree from "@/components/FilesTree";
import Loading from "@/components/Loading";
import EasterEgg from "../EasterEgg";

export default function Main() {
  const Terminal = dynamic(() => import("@/components/Terminal"), {
    ssr: false,
    loading: () => <Loading />,
  });

  return (
    <div className="w-screen h-screen bg-[#1d1f21] relative">
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
      <EasterEgg />
    </div>
  );
}
