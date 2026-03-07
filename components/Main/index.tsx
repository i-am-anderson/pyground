"use client";

import dynamic from "next/dynamic";
import { Panel, Group, Separator } from "react-resizable-panels";
import CodeBlock from "@/components/CodeBlock";
import FilesTree from "@/components/FilesTree";
import Loading from "@/components/Loading";
import EasterEgg from "../EasterEgg";
import { useEffect, useState } from "react";

export default function Main() {
  const [showConsole, setShowConsole] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowConsole(params.get("console") === "false" ? false : true);
  }, []);

  const Terminal = dynamic(() => import("@/components/Terminal"), {
    ssr: false,
    loading: () => <Loading />,
  });

  return (
    <div className="relative w-screen h-screen bg-[url(/wallpaper.jpg)] bg-cover bg-center">
      <div className="absolute top-0 left-0 w-full h-full bg-[#1d1f21] opacity-96"></div>
      <Group orientation="horizontal" className="relative">
        <Panel defaultSize={20} minSize={100}>
          <FilesTree />
        </Panel>

        <Separator />

        {showConsole ? (
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
        ) : (
          <Panel defaultSize={80}>
            <CodeBlock />
          </Panel>
        )}
      </Group>
      <EasterEgg />
    </div>
  );
}
