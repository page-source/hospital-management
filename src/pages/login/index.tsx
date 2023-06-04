import React, { useEffect, useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useRouter } from "next/router";

import api from "components/axios";
import styles from "./styles/login.module.scss";

interface ILoginFormValues {
  emailId: string;
  password: string;
}

const Login = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const isLoggedIn = !!(
      typeof window !== "undefined" && localStorage.getItem("user-access-token")
    );

    if (isLoggedIn) {
      router.replace("/");
    }
  }, []);

  const handleLogin = (values: ILoginFormValues) => {
    setSubmitting(true);
    api
      .post("/pht/v1/api/customers/action/ops-login", values)
      .then((resp) => {
        if (resp.data?.data?.accessToken?.access_token) {
          message.success({
            content: "User successfully loggedIn!",
            key: "login",
            duration: 4,
          });
          localStorage.setItem(
            "user-access-token",
            resp.data.data.accessToken.access_token
          );
          localStorage.setItem("user-details", JSON.stringify(resp.data.data));
          window.location.pathname = "/";
        } else {
          message.error({
            content: resp.data?.status || "Login failed!",
            key: "login",
            duration: 4,
          });
        }
      })
      .catch(console.log)
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <div className={styles["wrapper"]}>
      <div className={styles["logo-wrapper"]}>
        <img src="/logo.png" />
        <h2 className={styles["logo-title"]}>Healkin</h2>
      </div>

      <div className={styles["inner-wrapper"]}>
        <h1 className={styles["title"]}>Login Form</h1>
        <div className={styles["container"]}>
          <div className={styles["form-container"]}>
            <h2 className={styles["title"]}>Please login to continue</h2>
            <Form
              name="login-form"
              initialValues={{ remember: true }}
              disabled={submitting}
              onFinish={handleLogin}
              autoComplete="off"
              requiredMark={false}
              labelCol={{ span: 24 }}
              validateTrigger={["onBlur", "onChange"]}
            >
              <Form.Item
                label="Email"
                name="emailId"
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Please input valid email!" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
              >
                <Input type="password" />
              </Form.Item>

              <Button
                loading={submitting}
                type="primary"
                htmlType="submit"
                className={styles["form-submit-btn"]}
              >
                Login
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
