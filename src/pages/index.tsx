import { useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = !!(
      typeof window !== "undefined" && localStorage.getItem("user-access-token")
    );

    router.replace(isLoggedIn ? "/booking" : "/login");
  }, []);

  return <div style={{ padding: "0 2rem" }}>Redirecting...</div>;
};

export default Home;
