import Image from "next/image";
import { FC } from "react";

type Data = {
  title: React.ReactNode | string;
  children: React.ReactNode;
};

const PublicContainer: FC<Data> = ({ title, children }) => {
  return (
    <div className="bg-background h-screen">
      <div
        className="bg-white shadow-md h-12 flex items-center px-4"
        style={{ height: "48px", position: "sticky", zIndex: 999 }}
      >
        <div className="mr-3">
          <Image
            src="/logo.png"
            layout="fixed"
            alt="logo"
            width={30}
            height={30}
          />
        </div>

        {title}
      </div>
      <div
        className="p-6"
        style={{ height: "calc(100vh - 48px)", overflow: "auto" }}
      >
        {children}
      </div>
    </div>
  );
};

export default PublicContainer;
