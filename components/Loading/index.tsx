import Image from "next/image";

const Loading = () => {
  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image src="beanEater.svg" alt="Loading..." width={100} height={100} />
    </div>
  );
};

export default Loading;
