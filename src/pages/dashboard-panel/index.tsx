import { useEffect, useState } from "react";
import { Button, Form, Input, message, Select, Spin } from "antd";

import api from "components/axios";
import Container from "components/Container";
import { IDashboardPanel } from "interfaces/dashboard-panel";

import styles from "./styles/dashboardBanner.module.scss";

const clickActionOptions = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
];

const DashboardPanel = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [details, setDetails] = useState<IDashboardPanel>();

  const loadDetails = () => {
    setLoading(true);
    api
      .get("/pht/v1/api/dashboard")
      .then((r) => setDetails(r.data?.data || []))
      .catch(console.log)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDetails();
  }, []);

  const onSubmit = (values: any) => {
    setSubmitting(true);
    api
      .post("/pht/v1/api/dashboard/action/update-banner", {
        title: values.title?.trim(),
        shortDescription: values.shortDescription?.trim(),
        imageURL: values.imageURL?.trim(),
        clickAction: values.clickAction,
      })
      .then((r) => {
        if (r.data?.status !== "FAILURE") {
          message.success({
            content: "Updated successfully!",
            key: "dashboard",
            duration: 4,
          });
          loadDetails();
        } else {
          message.error({
            content: r.data.data || "Unable to update!",
            key: "dashboard",
            duration: 10,
          });
        }
      })
      .catch(console.log)
      .finally(() => setSubmitting(false));
  };

  return (
    <Container>
      <div className="bg-white border border-gray-300 pt-6 pl-4 pb-4 pr-4">
        {loading ? (
          <Spin />
        ) : (
          <>
            <h2 className={styles["main-title"]}>Edit Dashboard Banner</h2>
            <Form
              name="dashboard-banner"
              initialValues={details?.phtDashboardBanner}
              labelCol={{ span: 24 }}
              requiredMark={false}
              disabled={submitting}
              onFinish={onSubmit}
            >
              <Form.Item
                label="Title"
                name="title"
                rules={[
                  {
                    required: true,
                    message: "Please enter title!",
                  },
                ]}
              >
                <Input placeholder="Enter title" />
              </Form.Item>

              <Form.Item
                label="Short Description (Optional)"
                name="shortDescription"
                rules={[]}
              >
                <Input placeholder="Enter short description" />
              </Form.Item>

              <Form.Item
                label="Image URL (Optional)"
                name="imageURL"
                rules={[
                  {
                    type: "url",
                    message: "Please enter valid URL!",
                  },
                ]}
              >
                <Input placeholder="Enter Image URL" />
              </Form.Item>

              <Form.Item
                label="Click Action (Optional)"
                name="clickAction"
                rules={[]}
              >
                <Select
                  allowClear
                  placeholder="Select click action"
                  options={clickActionOptions}
                />
              </Form.Item>

              <Button type="primary" htmlType="submit" loading={submitting}>
                Save
              </Button>
            </Form>
          </>
        )}
      </div>
    </Container>
  );
};

export default DashboardPanel;
