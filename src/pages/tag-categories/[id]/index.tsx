import { useEffect, useState } from "react";
import { Spin, message, Form, Input, Button, Select } from "antd";

import Container from "components/Container";
import api from "components/axios";
import { useRouter } from "next/router";
import { ITag } from "interfaces/tag-interface";
import { ITagsCategory } from "interfaces/tags-category-interface";

import styles from "./styles/tagCategoryDetail.module.scss";

const TagCategoryDetail = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tagsList, setTagsList] = useState<ITag[]>();
  const [details, setDetails] = useState<ITagsCategory>();

  const creatingNew = router.query.id === "new";
  const categoryID = creatingNew ? "" : router.query.id;

  const fetchTagsList = () => {
    setTagsLoading(true);
    api
      .get("/pht/v1/api/tags")
      .then((r) => setTagsList(r.data?.data || []))
      .catch(console.log)
      .finally(() => setTagsLoading(false));
  };

  const loadDetails = () => {
    setLoading(true);
    api
      .get(
        "/pht/v1/api/tags-category/action/get-by-id?tag_category_id=" +
          categoryID
      )
      .then((r) => {
        if (r.data.status !== "FAILURE") {
          setDetails({
            ...r.data.data,
            tagIds: r.data.data.tagList?.map((el: ITag) => el.tagId) || [],
          });
        } else {
          message.error({
            content: r.data?.data || "Unable to fetch!",
            key: "tags-category",
            duration: 4,
          });
        }
      })
      .catch(console.log)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTagsList();
    if (categoryID) {
      loadDetails();
    }
  }, [categoryID]);

  const onSubmit = (values: any) => {
    setSubmitting(true);
    const method = creatingNew ? api.post : api.put;
    const submitObj: any = details ? { ...details } : {};
    submitObj.tagCategoryName = values.tagCategoryName?.trim();
    submitObj.tagCategoryShortDescription =
      values.tagCategoryShortDescription?.trim();
    submitObj.tagIconURL = values.tagIconURL?.trim();
    submitObj.tagIds = values.tagIds;
    if (categoryID) {
      submitObj.tagCategoryId = categoryID;
    }
    method("/pht/v1/api/tags-category", submitObj)
      .then((r) => {
        if (r.data?.status !== "FAILURE") {
          message.success({
            content: creatingNew
              ? "Created Successfully"
              : "Updated successfully!",
            key: "tags-category",
            duration: 4,
          });
          if (creatingNew) {
            router.push("/tag-categories");
          } else {
            loadDetails();
          }
        } else {
          message.error({
            content:
              r.data.data || `Unable to ${creatingNew ? "create" : "update"}!`,
            key: "tags-category",
            duration: 4,
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
              {creatingNew ? "Create Tag Category" : "Edit Tag Category"}
            </h2>
            <Form
              name="tag-category"
              initialValues={details}
              labelCol={{ span: 24 }}
              requiredMark={false}
              disabled={submitting}
              onFinish={onSubmit}
            >
              <Form.Item
                label="Name"
                name="tagCategoryName"
                rules={[
                  {
                    required: true,
                    message: "Please enter name",
                  },
                ]}
              >
                <Input placeholder="Enter Tag Category Name" />
              </Form.Item>
              <Form.Item
                label="Description (Optional)"
                name="tagCategoryShortDescription"
                rules={[]}
              >
                <Input placeholder="Enter Tag Category Description" />
              </Form.Item>

              <Form.Item
                label="Icon URL (Optional)"
                name="tagIconURL"
                rules={[
                  {
                    type: "url",
                    message: "Please enter valid URL!",
                  },
                ]}
              >
                <Input placeholder="Enter Icon URL" />
              </Form.Item>

              <Form.Item
                label="Packages (Optional)"
                name="tagIds"
                rules={[{ type: "array" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select Tags"
                  loading={tagsLoading}
                  options={tagsList?.map((el) => ({
                    label: el.tagName,
                    value: el.tagId,
                  }))}
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
export default TagCategoryDetail;
