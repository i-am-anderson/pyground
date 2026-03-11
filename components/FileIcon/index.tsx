"use client";

import * as icons from "file-icons-js";

export default function FileIcon({ filename }: { filename: string }) {
  const name = icons.getClassWithColor(filename);

  return <i className={`${name} text-base`} />;
}