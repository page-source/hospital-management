import { useEffect, useState } from "react";
import {
  Spin,
  message,
  Form,
  Divider,
  Button,
  Select,
  Input,
  Switch,
} from "antd";
import TextArea from "antd/lib/input/TextArea";
import moment from "moment";

import Container from "components/Container";
import api from "components/axios";
import { useRouter } from "next/router";
import { IService } from "interfaces/service.interface";
import { ITag } from "interfaces/tag-interface";

import styles from "./styles/serviceDetail.module.scss";

const ServiceDetail = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<IService>();
  const [submitting, setSubmitting] = useState(false);
  const [tagsList, setTagsList] = useState<ITag[]>();
  const [tagsLoading, setTagsLoading] = useState(false);

  const serviceId = router.query.id;

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
      .get("/pht/v1/api/service/action/get-by-id?service_id=" + serviceId)
      .then((r) => {
        if (r.data.status !== "FAILURE") {
          setDetails({
            ...r.data.data,
            tagIds: r.data.data.tagIds || [],
          });
        } else {
          message.error({
            content: r.data.data || "Unable to fetch details!",
            key: "service",
            duration: 10,
          });
        }
      })
      .catch(console.log)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (serviceId) {
      loadDetails();
      fetchTagsList();
    }
  }, [serviceId]);

  const onSubmit = (values: any) => {
    setSubmitting(true);
    api
      .put("/pht/v1/api/service", { ...details, ...values })
      .then((r) => {
        if (r.data.status !== "FAILURE") {
          loadDetails();
          message.success({
            content: "Updated successfully!",
            key: "service",
            duration: 4,
          });
        } else {
          message.error({
            content: r.data.data || "Unable to fetch details!",
            key: "service",
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
          <Spin style={{ display: "block" }} />
        ) : (
          <Form
            name="services"
            initialValues={details}
            labelCol={{ span: 24 }}
            disabled={submitting}
            onFinish={onSubmit}
          >
            {/* Basic Details */}
            <>
              <h2 className={styles["main-title"]}>Basic Details</h2>

              <div className="flex pb-2">
                <div className={styles["field-title"]}>Name :</div>
                <div className={styles["field-value"]}>
                  <Form.Item
                    label=""
                    name="name"
                    rules={[
                      {
                        whitespace: true,
                        required: true,
                        message: "Name is required!",
                      },
                    ]}
                  >
                    <Input placeholder="Enter name" />
                  </Form.Item>
                </div>
              </div>

              <div className="flex pb-2">
                <div className={styles["field-title"]}>Short Description :</div>
                <div className={styles["field-value"]}>
                  <Form.Item label="" name="shortDescription">
                    <Input placeholder="Enter short description" />
                  </Form.Item>
                </div>
              </div>

              <div className="flex pb-2">
                <div className={styles["field-title"]}>Long Description :</div>
                <div className={styles["field-value"]}>
                  <Form.Item label="" name="longDescription">
                    <TextArea
                      placeholder="Enter long description"
                      autoSize={{ minRows: 4, maxRows: 4 }}
                    />
                  </Form.Item>
                </div>
              </div>

              <div className="flex pb-2">
                <div className={styles["field-title"]}>Regular Price :</div>
                <div className={styles["field-value"]}>
                  <Form.Item label="" name="regularPrice">
                    <Input type="number" placeholder="Enter price" />
                  </Form.Item>
                </div>
              </div>

              <div className="flex pb-2">
                <div className={styles["field-title"]}>Sequence Number :</div>
                <div className={styles["field-value"]}>
                  <Form.Item label="" name="sequenceNumber">
                    <Input type="number" placeholder="Enter sequence Number" />
                  </Form.Item>
                </div>
              </div>

              <div className="flex pb-2">
                <div className={styles["field-title"]}>Icon URL :</div>
                <div className={styles["field-value"]}>
                  <Form.Item label="" name="iconURL">
                    <Input type="url" placeholder="Enter icon URL" />
                  </Form.Item>
                </div>
              </div>

              <div className="flex pb-2">
                <div className={styles["field-title"]}>Image URL :</div>
                <div className={styles["field-value"]}>
                  <Form.Item label="" name="imageURL">
                    <Input type="url" placeholder="Enter image URL" />
                  </Form.Item>
                </div>
              </div>

              <div className="flex pb-2">
                <div className={styles["field-title"]}>Auto Assign? :</div>
                <div>
                  <Form.Item name="autoAssign" valuePropName="checked">
                    <Switch loading={submitting} />
                  </Form.Item>
                </div>
              </div>

              <div className="flex pb-2">
                <div className={styles["field-title"]}>Locations :</div>
                <div>{details?.locations?.join(", ") || "--"}</div>
              </div>

              <div className="flex pb-2">
                <div className={styles["field-title"]}>Created At :</div>
                <div>
                  {details?.createdAt
                    ? moment(details.createdAt).format("MMM Do YY, hh:mm A")
                    : "--"}
                </div>
              </div>
            </>

            <Divider />

            {/* More Details */}
            <>
              <h2 className={styles["main-title"]}>More Details</h2>

              <Form.Item
                label="Packages"
                name="tagIds"
                rules={[{ type: "array" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select Packages"
                  loading={tagsLoading}
                  options={tagsList?.map((el) => ({
                    label: el.tagName,
                    value: el.tagId,
                  }))}
                />
              </Form.Item>
            </>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Save
            </Button>
          </Form>
        )}
      </div>
    </Container>
  );
};
export default ServiceDetail;
