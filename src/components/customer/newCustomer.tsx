import { useEffect, useState } from "react";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
// import moment from "moment";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Row,
  Select,
  Spin,
  // Switch,
  Upload,
} from "antd";

import api from "components/axios";
import { getBase64FromURL } from "commonFunctions/upload-helper";
import { IStaffMember } from "interfaces/staff-member.interface";

import styles from "./styles/customerDetail.module.scss";

const getRandomString = () => Math.random().toString();

const NewCustomer = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const profilePictureValue = Form.useWatch("profileImage", form);
  const profilePictureBase64Value = Form.useWatch("profilePictureBase64", form);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFieldKey, setUploadFieldKey] = useState(getRandomString());
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<IStaffMember>();

  const creatingNew = router.query.id === "new";

  useEffect(() => {
    if (profilePictureValue && typeof profilePictureValue !== "string") {
      form.setFieldValue("profileImage", undefined);
    }
  }, [profilePictureValue]);

  const onSubmit = (values: any) => {
    setSubmitting(true);
    const submitObj: any = {
      customerAddress: {
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2,
        city: values.city,
        country: values.country,
        pinCode: values.pinCode,
        state: values.state,
      },
      password: values.password,
      profileImage: values.profileImage,
      dob: values.dob,
      firstName: values.firstName,
      lastName: values.lastName,
      gender: values.gender,
      emailId: values.emailId,
      phoneNumber: values.phoneNumber,
      userRole: "PATIENT",
      source: "WEB",
      userLoginPlatform: "BASIC",
    };
    api
      .post("/pht/v1/api/customers", submitObj)
      .then((r) => {
        if (r.data?.status !== "FAILURE") {
          message.success({
            content: "Created Successfully",
            key: "new-customer",
            duration: 4,
          });
          router.replace(`/customers/${r.data.data?.customerId || ""}`);
        } else {
          message.error({
            content: r.data.data || "Unable to create!",
            key: "staff-member",
            duration: 4,
          });
        }
      })
      .catch(console.log)
      .finally(() => setSubmitting(false));
  };

  const onProfilePhotoUpload = (file: any) => {
    if (!file.type.startsWith("image/")) {
      message.error({
        content: "Please select valid file!",
        key: "uploadfiles",
        duration: 4,
      });
      setUploadFieldKey(getRandomString());
      return false;
    } else if (file.size >= 20000000) {
      message.error({
        content: "File too large! Please select a file under 20MB.",
        key: "uploadfiles",
        duration: 4,
      });
      setUploadFieldKey(getRandomString());
      return false;
    } else {
      const formData = new FormData();
      formData.append("file", file);
      setUploading(true);
      api
        .post("/pht/v1/api/file/action/upload", formData)
        .then(async (resp) => {
          const url = resp.data?.data;
          const base64URL = url ? await getBase64FromURL(url) : undefined;
          form.setFieldValue("profileImage", url);
          form.setFieldValue("profilePictureBase64", base64URL);
        })
        .finally(() => setUploading(false));
    }
  };

  return (
    <>
      <h2 className={styles["main-title"]}>Add a New Customer</h2>

      <Form
        name="new-customer"
        form={form}
        initialValues={details || {}}
        labelCol={{ span: 24 }}
        requiredMark={false}
        disabled={submitting}
        onFinish={onSubmit}
        scrollToFirstError
      >
        <>
          <legend>Basic Details</legend>
          <Row gutter={24}>
            <Col sm={24} md={16}>
              <Row gutter={24}>
                <Col sm={24} md={12}>
                  <Form.Item
                    label="First Name"
                    name="firstName"
                    rules={[{ required: true, message: "Please type name!" }]}
                  >
                    <Input placeholder="Type First Name" />
                  </Form.Item>
                </Col>

                <Col sm={24} md={12}>
                  <Form.Item
                    label="Last Name"
                    name="lastName"
                    rules={[{ required: true, message: "Please type name!" }]}
                  >
                    <Input placeholder="Type Last Name" />
                  </Form.Item>
                </Col>

                <Col sm={24} md={12}>
                  <Form.Item
                    label="Date of Birth"
                    name="dob"
                    rules={[{ required: true, message: "Please select DOB!" }]}
                  >
                    <DatePicker
                      format="DD-MMM-YYYY"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col sm={24} md={12}>
                  <Form.Item
                    label="Gender"
                    name="gender"
                    rules={[
                      { required: true, message: "Please select gender!" },
                    ]}
                  >
                    <Select
                      placeholder="Select Gender"
                      options={[
                        { label: "Male", value: "Male" },
                        { label: "Female", value: "Female" },
                        { label: "Others", value: "Others" },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col sm={24} md={12}>
                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Please input your password!",
                      },
                    ]}
                  >
                    <Input type="password" />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col sm={24} md={8}>
              <Form.Item name="profilePictureBase64" hidden />
              <Form.Item label="Profile Photo" name="profileImage">
                {profilePictureBase64Value ? (
                  <div className={styles["photo-field-div"]}>
                    <img
                      src={profilePictureBase64Value}
                      className={styles["photo-field"]}
                    />
                    <DeleteOutlined
                      className={styles["photo-remove-icon"]}
                      onClick={() => {
                        form.setFieldValue("profileImage", undefined);
                        form.setFieldValue("profilePictureBase64", undefined);
                      }}
                    />
                  </div>
                ) : uploading ? (
                  <Spin size="small" />
                ) : (
                  <Upload
                    listType="picture-card"
                    accept="image/*"
                    action=""
                    key={uploadFieldKey}
                    beforeUpload={onProfilePhotoUpload}
                  >
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                )}
              </Form.Item>
            </Col>

            <Row gutter={24}></Row>
          </Row>
        </>

        <>
          <legend>Contact Details</legend>
          <Row gutter={24}>
            <Col sm={24} md={12} lg={8}>
              <Form.Item
                label="Email"
                name="emailId"
                rules={[
                  { required: true, message: "Please type email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input placeholder="Type Email" />
              </Form.Item>
            </Col>

            <Col sm={24} md={12} lg={8}>
              <Form.Item
                label="Mobile Number"
                name="phoneNumber"
                rules={[
                  { required: true, message: "Please type mobile-number!" },
                ]}
              >
                <Input placeholder="Type Mobile Number" />
              </Form.Item>
            </Col>
          </Row>
        </>

        <>
          <legend>Address</legend>
          <Row gutter={24}>
            <Col sm={24} md={12} lg={8}>
              <Form.Item
                label="Address Line 1"
                name="addressLine1"
                rules={[
                  {
                    required: true,
                    message: "Please type address line 1!",
                  },
                ]}
              >
                <Input placeholder="Type Address Line 1" />
              </Form.Item>
            </Col>

            <Col sm={24} md={12} lg={8}>
              <Form.Item
                label="Address Line 2"
                name="addressLine2"
                rules={[
                  {
                    required: true,
                    message: "Please type address line 2!",
                  },
                ]}
              >
                <Input placeholder="Type Address Line 2" />
              </Form.Item>
            </Col>

            <Col sm={24} md={12} lg={8}>
              <Form.Item
                label="City"
                name="city"
                rules={[
                  {
                    required: true,
                    message: "Please type your city!",
                  },
                ]}
              >
                <Input placeholder="Type City" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col sm={24} md={12} lg={8}>
              <Form.Item
                label="Country"
                name="country"
                rules={[
                  {
                    required: true,
                    message: "Please type country!",
                  },
                ]}
              >
                <Input placeholder="Type Country" />
              </Form.Item>
            </Col>
            <Col sm={24} md={12} lg={8}>
              <Form.Item
                label="Pin Code"
                name="pinCode"
                rules={[
                  {
                    required: true,
                    message: "Please type Pin Code!",
                  },
                ]}
              >
                <Input placeholder="Type Pin Code" />
              </Form.Item>
            </Col>

            <Col sm={24} md={12} lg={8}>
              <Form.Item
                label="State"
                name="state"
                rules={[
                  {
                    required: true,
                    message: "Please type state!",
                  },
                ]}
              >
                <Input placeholder="Type state" />
              </Form.Item>
            </Col>
          </Row>
        </>

        <Button htmlType="submit" type="primary" className="mt-6">
          {creatingNew ? "Create" : "Update"}
        </Button>
      </Form>
    </>
  );
};

export default NewCustomer;
