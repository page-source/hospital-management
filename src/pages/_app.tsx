import Head from "next/head";
import { useEffect, useState } from "react";
import "tailwindcss/tailwind.css";
import type { AppProps } from "next/app";
import "antd/dist/antd.css";

import "../styles/antd.scss";
import "../styles/globals.scss";

import MidleWareAuthenitcation from "./_auth";
import { UserProvider } from "stores/user-context";

function App({ Component, pageProps }: AppProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userDetailsString = localStorage.getItem("user-details");
      setIsLoggedIn(!!userDetailsString);
      try {
        if (userDetailsString) {
          const tempObj = JSON.parse(userDetailsString);
          setUserDetails(tempObj);
        }
      } catch (e) {}
    }
  }, []);

  return (
    <>
      <Head>
        <title>Healkin - Command Centre</title>
        <meta name="description" content="Healkin - Command Centre" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <UserProvider value={{ userDetails, setUserDetails }}>
        <Component {...pageProps} />
      </UserProvider>
    </>
  );
}

export default MidleWareAuthenitcation(App);
