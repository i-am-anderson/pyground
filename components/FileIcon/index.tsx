"use client";

import * as icons from "file-icons-js";
import { useEffect, useState } from "react";

export default function FileIcon({ filename }: { filename: string }) {
  const [iconClass, setIconClass] = useState<string>("");

  useEffect(() => {
    const name = icons.getClassWithColor(filename);
    if (name) {
      setIconClass(name);
    }
  }, [filename]);

  return <i className={`${iconClass} text-base`} />;
}
