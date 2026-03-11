import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex h-full justify-center items-center">
      <Image src="/beanEater.svg" alt="Loading..." width={100} height={100} />
    </div>
  );
}