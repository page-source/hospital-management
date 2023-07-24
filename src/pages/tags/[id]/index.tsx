import { useEffect, useState } from "react";
import { Spin, message, Form, Input, Button } from "antd";
import { useRouter } from "next/router";

import Container from "components/Container";
import api from "components/axios";
import { ITag } from "interfaces/tag-interface";

import styles from "./styles/tags.module.scss";

const TagDetail = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [details, setDetails] = useState<ITag>();

  const creatingNew = router.query.id === "new";
  const tagID = creatingNew ? "" : router.query.id;

  const loadDetails = () => {
    setLoading(true);
    api
      .get("/pht/v1/api/tags/action/get-by-id?tag_id=" + tagID)
      .then((r) => {
        if (r.data?.status !== "FAILURE") {
          setDetails(r.data?.data || {});
        } else {
          message.error({
            content: r.data?.data || `Unable to fetch!`,
            key: "tags",
            duration: 10,
          });
        }
      })
      .catch(console.log)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (tagID) {
      loadDetails();
    }
  }, [router.query.id]);

  const onSubmit = (values: any) => {
    setSubmitting(true);
    const method = creatingNew ? api.post : api.put;
    const submitObj: any = details ? { ...details } : {};
    submitObj.tagName = values.tagName?.trim();
    submitObj.tagShortDescription = values.tagShortDescription?.trim();
    submitObj.tagImageURL = values.tagImageURL?.trim();
    if (tagID) {
      submitObj.tagId = tagID;
    }
    method("/pht/v1/api/tags", submitObj)
      .then((r) => {
        if (r.data?.status !== "FAILURE") {
          message.success({
            content: creatingNew
              ? "Created Successfully"
              : "Updated successfully!",
            key: "tags",
            duration: 4,
          });
          if (creatingNew) {
            router.push("/tags");
          } else {
            loadDetails();
          }
        } else {
          message.error({
            content:
              r.data.data || `Unable to ${creatingNew ? "create" : "update"}!`,
            key: "tags",
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
            <h2 className={styles["main-title"]}>
              {creatingNew ? "Create Package" : "View Package"}
            </h2>

            <Form
              name="tag"
              initialValues={details}
              labelCol={{ span: 24 }}
              requiredMark={false}
              disabled={submitting}
              onFinish={onSubmit}
            >
              <Form.Item
                label="Name"
                name="tagName"
                rules={[
                  {
                    required: true,
                    message: "Please enter name",
                  },
                ]}
              >
                <Input placeholder="Enter Package name" />
              </Form.Item>

              <Form.Item
                label="Description (Optional)"
                name="tagShortDescription"
                rules={[]}
              >
                <Input placeholder="Enter Package description" />
              </Form.Item>

              <Form.Item
                label="Image URL (Optional)"
                name="tagImageURL"
                rules={[
                  {
                    type: "url",
                    message: "Please enter valid URL!",
                  },
                ]}
              >
                <Input placeholder="Enter Image URL" />
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
export default TagDetail;
