import { FC, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Tooltip } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

import useAppStore from "stores/app.store";
import { useUserContext } from "stores/user-context";

import styles from "./styles/container.module.scss";

type Data = {
  children: React.ReactNode;
  extraContent?: React.ReactNode;
};

type MenuItem = {
  pageIndex: number;
  pageName: string;
  icon: string;
};

const menuMaps: { [key: string]: MenuItem } = {
  "/booking": {
    pageIndex: 0,
    pageName: "Bookings",
    icon: "/booking.png",
  },
  "/payment": {
    pageIndex: 1,
    pageName: "Payments",
    icon: "/money-bag.png",
  },
  "/staff-list": {
    pageIndex: 2,
    pageName: "Staff List",
    icon: "/caregiver.png",
  },
  "/services": {
    pageIndex: 3,
    pageName: "Services",
    icon: "/services_icon.png",
  },
  "/customers": {
    pageIndex: 4,
    pageName: "Customers",
    icon: "/customer.png",
  },
  // "/tags": {
  //   pageIndex: 5,
  //   pageName: "Packages",
  //   icon: "/price_tag.png",
  // },
  // "/tag-categories": {
  //   pageIndex: 6,
  //   pageName: "Packages Categories",
  //   icon: "/price_tag.png",
  // },
  // "/dashboard-panel": {
  //   pageIndex: 7,
  //   pageName: "Dashboard Panel",
  //   icon: "/money-bag.png",
  // },
};

const Container: FC<Data> = ({ children, extraContent }) => {
  const router = useRouter();
  const appStore = useAppStore();
  const [user] = useUserContext();
  const [collapsed, setCollapsed] = useState(
    () => !!JSON.parse(localStorage.getItem("isCollapsed") || "false")
  );

  const userName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`
    : "";

  const logout = () => {
    window.localStorage.clear();
    window.location.pathname = "/";
  };

  const onCollapse = () => {
    localStorage.setItem("isCollapsed", JSON.stringify(!collapsed));
    setCollapsed(!collapsed);
  };

  useEffect(() => {
    const matchedKey = Object.keys(menuMaps).find((el) =>
      location.pathname.startsWith(el)
    );
    if (matchedKey && menuMaps[matchedKey]) {
      appStore.setPageIndex(menuMaps[matchedKey].pageIndex);
      appStore.setPageName(menuMaps[matchedKey].pageName);
    }
  }, [location.pathname]);

  return (
    <div
      className={`bg-background w-full h-screen flex flex-row ${
        collapsed ? styles["collapsed-section"] : ""
      }`}
    >
      <div
        className={`bg-white shadow-md h-full flex flex-col z-10 ${styles["left-section"]} `}
      >
        <div className={styles["logo-wrapper"]}>
          <div className={styles["logo-img"]}>
            <Image
              src="/logo.png"
              layout="fixed"
              alt="Healkin"
              width={35}
              height={35}
            />
          </div>
          <h3 className={styles["logo-title"]}>Healkin</h3>
        </div>
        <div className={`flex-grow ${styles["menu-wrapper"]}`}>
          {Object.keys(menuMaps).map((menuElRoute) => {
            const menuEl = menuMaps[menuElRoute];
            return (
              <Tooltip
                key={menuElRoute}
                title={collapsed ? menuEl.pageName : ""}
                placement="right"
              >
                <div
                  onClick={() => router.push(menuElRoute)}
                  className={`flex items-center ${styles["menu-item"]} ${
                    appStore.pageIndex === menuEl.pageIndex
                      ? `bg-background ${styles["menu-items-active"]}`
                      : ""
                  }`}
                >
                  <img
                    src={menuEl.icon}
                    width={20}
                    height={20}
                    alt={menuEl.pageName}
                  />
                  <span className={styles["menu-items-title"]}>
                    {menuEl.pageName}
                  </span>
                </div>
              </Tooltip>
            );
          })}
        </div>

        <div>
          <div className={styles["logged-in-wrapper"]}>
            <p className={styles["logged-in-title"]}>Logged In as:</p>
            <div className={styles["logged-in-val"]}>
              <Tooltip title={userName}>
                <p>{userName}</p>
              </Tooltip>
              <Tooltip title={user.emailId}>
                <p>({user.emailId || "--"})</p>
              </Tooltip>
            </div>
          </div>
        </div>
        <Tooltip title={collapsed ? "Logout" : ""} placement="right">
          <div className={styles["logout-wrapper"]} onClick={logout}>
            <img src="/logout.svg" width={18} height={18} />
            <span>Logout</span>
          </div>
        </Tooltip>
      </div>

      <div className={`flex-grow ${styles["right-section"]}`}>
        <div
          className="bg-white shadow-md h-12 flex items-center px-4"
          style={{ height: "48px", position: "sticky", zIndex: 999 }}
        >
          <div
            onClick={onCollapse}
            className="pointer"
            style={{ marginRight: 16, lineHeight: 1 }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          {appStore.pageName}
          {extraContent}
        </div>
        <div
          className="p-6"
          style={{ height: "calc(100vh - 48px)", overflow: "auto" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Container;
