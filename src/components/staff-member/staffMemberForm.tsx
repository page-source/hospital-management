import { useEffect, useState } from "react";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import moment from "moment";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Row,
  Select,
  Checkbox,
  Spin,
  Switch,
  Upload,
} from "antd";

import api from "components/axios";
import { getBase64FromURL } from "commonFunctions/upload-helper";
import { IStaffMember } from "interfaces/staff-member.interface";

import styles from "./styles/staffMember.module.scss";

const getRandomString = () => Math.random().toString();

const StaffMemberForm = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const profilePictureValue = Form.useWatch("profilePicture", form);
  const profilePictureBase64Value = Form.useWatch("profilePictureBase64", form);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFieldKey, setUploadFieldKey] = useState(getRandomString());
  const [loading, setLoading] = useState(false);
  const [serviceTypes, setServiceableTypes] = useState<any>([]);
  const [details, setDetails] = useState<IStaffMember>();

  const creatingNew = router.query.id === "new";

  const loadDetails = () => {
    setLoading(true);
    api
      .get("/pht/v1/api/staff/action/get-by-id", {
        params: { staff_id: router.query.id },
      })
      .then((r) => {
        if (r.data?.status !== "FAILURE") {
          (async function () {
            const obj = r.data?.data || {};
            if (obj.profilePicture) {
              obj.profilePictureBase64 = await getBase64FromURL(
                obj.profilePicture
              );
            }
            let docArr = [];
            if (Object.keys(obj.documents || {}).length) {
              for (let docName in obj.documents) {
                const base64URL = obj.documents[docName]
                  ? await getBase64FromURL(obj.documents[docName])
                  : "";
                docArr.push({
                  docName,
                  file: obj.documents[docName],
                  fileBase64: base64URL,
                });
              }
            }
            obj.documents = docArr;

            obj.dob = obj.dob ? moment(obj.dob, "DD-MMM-YYYY") : undefined;
            obj.month = obj.month ? moment(obj.month, "MMM") : undefined;
            obj.joiningDate = obj.joiningDate
              ? moment(obj.joiningDate, "DD-MMM-YYYY")
              : undefined;
            obj.ncrExpiryDate = obj.ncrExpiryDate
              ? moment(obj.ncrExpiryDate, "YYYY-MM-DD")
              : undefined;
            obj.letterStartDate = obj.letterStartDate
              ? moment(obj.letterStartDate, "YYYY-MM-DD")
              : undefined;
            obj.letterEndDate = obj.letterEndDate
              ? moment(obj.letterEndDate, "YYYY-MM-DD")
              : undefined;
            obj.language = obj.language ? obj.language.split(", ") : [];
            setDetails(obj);

            form.setFieldsValue(obj);
            setLoading(false);
          })();
        } else {
          setLoading(false);
          message.error({
            content: r.data.data || "Unable to fetch!",
            key: "staff-member",
            duration: 4,
          });
          router.push("/staff-list");
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const loadServiceableServiceTypes = () => {
    api
      .get("/pht/v1/api/staff/action/list-service-types")
      .then((r) => {
        const serviceArr = Object.values(r.data?.data);
        setServiceableTypes(serviceArr || []);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (!creatingNew && router.query.id) {
      loadDetails();
    }
  }, [router.query.id]);

  useEffect(() => {
    loadServiceableServiceTypes();
  }, []);

  useEffect(() => {
    if (profilePictureValue && typeof profilePictureValue !== "string") {
      form.setFieldValue("profilePicture", undefined);
    }
  }, [profilePictureValue]);

  const onSubmit = (values: any) => {
    setSubmitting(true);
    const submitObj: any = {
      ...(details || {}),
      ...values,
      status: "ACTIVE",
      dob: values.dob.format("YYYY-MM-DD"),
      month: values.month.format("MMM"),
      joiningDate: values.joiningDate.format("YYYY-MM-DD"),
      ncrExpiryDate: values.ncrExpiryDate.format("YYYY-MM-DD"),
      letterStartDate: values.letterStartDate.format("YYYY-MM-DD"),
      letterEndDate: values.letterEndDate.format("YYYY-MM-DD"),
      language: values.language?.join(", "),
      documents: {},
    };
    if (submitObj.profilePictureBase64) {
      delete submitObj.profilePictureBase64;
    }
    if (values.documents?.length) {
      values.documents?.forEach((el: any) => {
        submitObj.documents[el.docName] = el.file;
      });
    }

    const method = creatingNew ? api.post : api.put;

    method("/pht/v1/api/staff", submitObj)
      .then((r) => {
        if (r.data?.status !== "FAILURE") {
          message.success({
            content: `${creatingNew ? "Created" : "Updated"} Successfully`,
            key: "staff-member",
            duration: 4,
          });
          router.replace(`/staff-list/${r.data.data?.staffId || ""}`);
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
          form.setFieldValue("profilePicture", url);
          form.setFieldValue("profilePictureBase64", base64URL);
        })
        .finally(() => setUploading(false));
    }
  };

  return (
    <>
      <h2 className={styles["main-title"]}>{`${
        creatingNew ? "Create New" : "Edit"
      } Staff Member`}</h2>

      {loading ? (
        <div className="spinner-container">
          <Spin />
        </div>
      ) : (
        <Form
          name="staff-member"
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
                      label="Employee Name"
                      name="employeeName"
                      rules={[{ required: true, message: "Please type name!" }]}
                    >
                      <Input placeholder="Type Name" />
                    </Form.Item>
                  </Col>

                  <Col sm={24} md={12}>
                    <Form.Item
                      label="Father's Name"
                      name="fatherName"
                      rules={[
                        {
                          required: true,
                          message: "Please type father's name!",
                        },
                      ]}
                    >
                      <Input placeholder="Type Father's Name" />
                    </Form.Item>
                  </Col>

                  <Col sm={24} md={12}>
                    <Form.Item
                      label="Month"
                      name="month"
                      rules={[
                        {
                          required: true,
                          message: "Please select month!",
                        },
                      ]}
                    >
                      <DatePicker.MonthPicker
                        placeholder="Select Month"
                        format="MMM"
                        mode="month"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>

                  <Col sm={24} md={12}>
                    <Form.Item
                      label="Date of Birth"
                      name="dob"
                      rules={[
                        { required: true, message: "Please select DOB!" },
                      ]}
                    >
                      <DatePicker
                        format="DD-MMM-YYYY"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item name="profilePictureBase64" hidden />
                <Form.Item label="Profile Photo" name="profilePicture">
                  {profilePictureBase64Value ? (
                    <div className={styles["photo-field-div"]}>
                      <img
                        src={profilePictureBase64Value}
                        className={styles["photo-field"]}
                      />
                      <DeleteOutlined
                        className={styles["photo-remove-icon"]}
                        onClick={() => {
                          form.setFieldValue("profilePicture", undefined);
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
            </Row>

            <Row gutter={24}>
              <Col sm={24} md={8}>
                <Form.Item
                  label="Gender"
                  name="gender"
                  rules={[{ required: true, message: "Please select gender!" }]}
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

              <Col sm={24} md={8}>
                <Form.Item
                  label="Age"
                  name="age"
                  rules={[{ required: true, message: "Please enter age!" }]}
                >
                  <Input
                    type="number"
                    placeholder="Type Age"
                    max={100}
                    min={10}
                  />
                </Form.Item>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item
                  label="Joining Date"
                  name="joiningDate"
                  rules={[
                    {
                      required: true,
                      message: "Please select Joining Date!",
                    },
                  ]}
                >
                  <DatePicker format="DD-MMM-YYYY" style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item
                  label="ID"
                  name="hasID"
                  rules={[
                    {
                      required: true,
                      message: "Please select value!",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select value"
                    options={[
                      { label: "Yes", value: true },
                      { label: "No", value: false },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item
                  label="Verification"
                  name="verification"
                  rules={[
                    {
                      required: true,
                      message: "Please enter value!",
                    },
                  ]}
                >
                  <Input placeholder="Type value" />
                </Form.Item>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item
                  label="Contract"
                  name="contract"
                  rules={[
                    {
                      required: true,
                      message: "Please select contract!",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select contract"
                    options={[
                      { value: "Sign Done" },
                      { value: "Given on Whatsapp" },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
          </>

          <>
            <legend>Employment Details</legend>
            <Row gutter={24}>
              <Col sm={24} md={8}>
                <Form.Item
                  label="Staff Type"
                  name="role"
                  rules={[
                    {
                      required: true,
                      message: "Please enter staff type!",
                    },
                  ]}
                >
                  <Input placeholder="Type staff type" />
                </Form.Item>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item
                  label="Department"
                  name="department"
                  rules={[
                    {
                      required: true,
                      message: "Please enter department!",
                    },
                  ]}
                >
                  <Input placeholder="Type department" />
                </Form.Item>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item
                  label="Cost Centre"
                  name="costCentre"
                  rules={[
                    {
                      required: true,
                      message: "Please enter cost centre!",
                    },
                  ]}
                >
                  <Input placeholder="Type cost centre" />
                </Form.Item>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item
                  label="Retainer Employee No."
                  name="retainerEmpNo"
                  rules={[
                    {
                      required: true,
                      message: "Please type Retainer Employee No.!",
                      whitespace: true,
                    },
                  ]}
                >
                  <Input placeholder="Type Retainer Employee No." />
                </Form.Item>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item
                  label="Retainer Contract No."
                  name="retainerContactNumber"
                  rules={[
                    {
                      required: true,
                      message: "Please type Retainer Contract No.!",
                      whitespace: true,
                    },
                  ]}
                >
                  <Input placeholder="Type Retainer Contract No." />
                </Form.Item>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item
                  label="Per Visit Charge"
                  name="perVisitCharges"
                  rules={[
                    {
                      required: true,
                      message: "Please type per visit charge!",
                      whitespace: true,
                    },
                  ]}
                >
                  <Input
                    placeholder="Type per visit charge"
                    prefix="₹ "
                    type="number"
                  />
                </Form.Item>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item
                  label="Tele-Service Charge"
                  name="teleServiceCharges"
                  rules={[
                    {
                      required: true,
                      message: "Please type tele-service charge!",
                      whitespace: true,
                    },
                  ]}
                >
                  <Input
                    placeholder="Type tele-service charge"
                    prefix="₹ "
                    type="number"
                  />
                </Form.Item>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item
                  label="Retainership Fees-Standard (12 HRS)"
                  name="retainerShipFeeStandard12Hours"
                  rules={[
                    {
                      required: true,
                      message: "Please type value!",
                      whitespace: true,
                    },
                  ]}
                >
                  <Input placeholder="Type value" prefix="₹ " type="number" />
                </Form.Item>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item
                  label="Retainership Fees-Advanced (24 HRS)"
                  name="retainerShipFeeAdvanced24Hours"
                  rules={[
                    {
                      required: true,
                      message: "Please type value!",
                      whitespace: true,
                    },
                  ]}
                >
                  <Input placeholder="Type value" prefix="₹ " type="number" />
                </Form.Item>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item
                  label="Available for Duty"
                  name="availableOnDuty"
                  rules={[
                    {
                      required: true,
                      message: "Please type value!",
                      whitespace: true,
                    },
                  ]}
                >
                  <Input placeholder="Type value" />
                </Form.Item>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item
                  label="Covid Duty - 24 HRS"
                  name="covidDuty24Hours"
                  rules={[
                    {
                      required: true,
                      message: "Please type value!",
                      whitespace: true,
                    },
                  ]}
                >
                  <Input placeholder="Type value" />
                </Form.Item>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item
                  label="Location"
                  name="location"
                  rules={[{ required: true, message: "Please type location!" }]}
                >
                  <Input placeholder="Type location" />
                </Form.Item>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item
                  label="Relevant Experience (in Years)"
                  name="relevantExperienceInnYears"
                  rules={[
                    {
                      required: true,
                      message: "Please type relevant experience!",
                    },
                  ]}
                >
                  <Input
                    placeholder="Type relevant experience"
                    type="number"
                    suffix="Years"
                  />
                </Form.Item>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item
                  label="Nursing Council Registration No."
                  name="nursingCouncilRegistrationNumber"
                  rules={[
                    {
                      required: true,
                      message: "Please type value!",
                      whitespace: true,
                    },
                  ]}
                >
                  <Input placeholder="Type value" />
                </Form.Item>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item
                  label="NCR Expiry Date"
                  name="ncrExpiryDate"
                  rules={[
                    {
                      required: true,
                      message: "Please select NCR Expiry Date!",
                    },
                  ]}
                >
                  <DatePicker format="DD-MMM-YYYY" style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item
                  label="Letter Start Date"
                  name="letterStartDate"
                  rules={[
                    {
                      required: true,
                      message: "Please select Letter Start Date!",
                    },
                  ]}
                >
                  <DatePicker format="DD-MMM-YYYY" style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item
                  label="Letter End Date"
                  name="letterEndDate"
                  rules={[
                    {
                      required: true,
                      message: "Please select Letter End Date!",
                    },
                  ]}
                >
                  <DatePicker format="DD-MMM-YYYY" style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item
                  label="Lead Sending Enabled?"
                  name="isLeadSendingEnabled"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item
                  label="Servicable Zipcodes"
                  name="serviceableZipCodes"
                  rules={[
                    {
                      type: "array",
                      required: true,
                      message: "Please type servicable zipcodes!",
                    },
                  ]}
                >
                  <Select
                    mode="tags"
                    placeholder="Type zipcodes"
                    popupClassName="d-none"
                  />
                </Form.Item>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item
                  label="Serviceable Servicessss"
                  name="serviceableServices"
                  rules={[
                    {
                      required: true,
                      message: "Please type serviceable services!",
                    },
                  ]}
                >
                  <Checkbox.Group>
                    {serviceTypes.map((option: any) => (
                      <Checkbox key={option} value={option}>
                        {option}
                      </Checkbox>
                    ))}
                  </Checkbox.Group>
                </Form.Item>
              </Col>
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
                  name="mobileNumber"
                  rules={[
                    { required: true, message: "Please type mobile-number!" },
                  ]}
                >
                  <Input placeholder="Type Mobile Number" />
                </Form.Item>
              </Col>

              <Col sm={24} md={12} lg={8}>
                <Form.Item
                  label="Emergency Contact Number"
                  name="emergencyContactNumber"
                  dependencies={["mobileNumber"]}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (
                          value &&
                          getFieldValue("mobileNumber") &&
                          value.trim() === getFieldValue("mobileNumber").trim()
                        ) {
                          return Promise.reject(
                            new Error("Same number not allowed!")
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input placeholder="Type Emergency Contact Number" />
                </Form.Item>
              </Col>
            </Row>
          </>

          <>
            <legend>Address</legend>
            <Row gutter={24}>
              <Col sm={24} md={12} lg={8}>
                <Form.Item
                  label="Current Address"
                  name="currentAddress"
                  rules={[
                    {
                      required: true,
                      message: "Please type current address!",
                      whitespace: true,
                    },
                  ]}
                >
                  <Input.TextArea
                    placeholder="Type Current Address"
                    autoSize={{ minRows: 4, maxRows: 4 }}
                  />
                </Form.Item>
              </Col>

              <Col sm={24} md={12} lg={8}>
                <Form.Item
                  label="Address as on Aadhasr"
                  name="addressAsOnAadhaar"
                  rules={[
                    {
                      required: true,
                      message: "Please type address as on Aadhaar!",
                      whitespace: true,
                    },
                  ]}
                >
                  <Input.TextArea
                    placeholder="Type Address as on Aadhasr"
                    autoSize={{ minRows: 4, maxRows: 4 }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </>

          <>
            <legend>Bank Details</legend>
            <Row gutter={24}>
              <Col sm={24} md={12} lg={8}>
                <Form.Item
                  label="Name As Per Bank"
                  name="nameAsPerBank"
                  rules={[
                    {
                      required: true,
                      message: "Please type name!",
                      whitespace: true,
                    },
                  ]}
                >
                  <Input placeholder="Type Name as per Bank" />
                </Form.Item>
              </Col>

              <Col sm={24} md={12} lg={8}>
                <Form.Item
                  label="PAN No"
                  name="panNo"
                  rules={[
                    {
                      required: true,
                      message: "Please type PAN no!",
                      whitespace: true,
                    },
                  ]}
                >
                  <Input placeholder="Type PAN no." />
                </Form.Item>
              </Col>

              <Col sm={24} md={12} lg={8}>
                <Form.Item
                  label="Bank Name"
                  name="bankName"
                  rules={[
                    {
                      required: true,
                      message: "Please type bank name!",
                      whitespace: true,
                    },
                  ]}
                >
                  <Input placeholder="Type Bank Name" />
                </Form.Item>
              </Col>

              <Col sm={24} md={12} lg={8}>
                <Form.Item
                  label="Bank Account Number"
                  name="bankAccountNumber"
                  rules={[
                    {
                      required: true,
                      message: "Please type bank account number!",
                      whitespace: true,
                    },
                  ]}
                >
                  <Input placeholder="Type Bank account number" />
                </Form.Item>
              </Col>

              <Col sm={24} md={12} lg={8}>
                <Form.Item
                  label="IFSC CODE"
                  name="ifscCode"
                  rules={[
                    {
                      required: true,
                      message: "Please type Bank IFSC CODE!",
                      whitespace: true,
                    },
                  ]}
                >
                  <Input placeholder="Type Bank IFSC CODE" />
                </Form.Item>
              </Col>

              <Col sm={24} md={12} lg={8}>
                <Form.Item
                  label="Aadhaar Number"
                  name="aadhaarNumber"
                  rules={[
                    {
                      required: true,
                      message: "Please type Aadhaar Number!",
                      whitespace: true,
                    },
                  ]}
                >
                  <Input placeholder="Type Aadhaar Number" type="number" />
                </Form.Item>
              </Col>
            </Row>
          </>

          <div className={styles["table-wrapper"]}>
            <legend>Other Details</legend>

            <Row gutter={24}>
              <Col sm={24} md={8}>
                <Form.Item
                  label="Highest Education"
                  name="highestEducation"
                  rules={[
                    {
                      required: true,
                      message: "Please type highest education!",
                      whitespace: true,
                    },
                  ]}
                >
                  <Input placeholder="Type highest education" />
                </Form.Item>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item
                  label="Signatory"
                  name="signatory"
                  rules={[
                    {
                      required: true,
                      message: "Please type signatory!",
                      whitespace: true,
                    },
                  ]}
                >
                  <Input placeholder="Type signatory" />
                </Form.Item>
              </Col>

              <Col sm={24} md={8}>
                <Form.Item label="Remarks" name="remarks" rules={[]}>
                  <Input placeholder="Type remarks" />
                </Form.Item>
              </Col>

              <Col sm={24} md={16}>
                <Form.Item
                  label="Languages"
                  name="language"
                  rules={[
                    {
                      type: "array",
                      required: true,
                      message: "Please type languages!",
                    },
                  ]}
                >
                  <Select
                    mode="tags"
                    placeholder="Type languages"
                    popupClassName="d-none"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.List name="documents">
              {(fields, { add, remove }) => (
                <div className="flex gap-2">
                  <table>
                    <colgroup>
                      <col style={{ width: 350 }} />
                      <col style={{ width: 140 }} />
                      <col style={{ width: 110 }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>Document Name</th>
                        <th>Document</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields?.length > 0 ? (
                        fields.map((field, index) => (
                          <DocumentTableRow
                            key={index}
                            field={field}
                            remove={remove}
                            index={index}
                            form={form}
                          />
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="text-center"
                            style={{ padding: "1.5rem" }}
                          >
                            No Documents added
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <Button
                    type="primary"
                    disabled={fields?.length >= 5}
                    onClick={() => add({ docName: "", file: "" })}
                  >
                    Add New
                  </Button>
                </div>
              )}
            </Form.List>
          </div>

          <Button htmlType="submit" type="primary" className="mt-6">
            {creatingNew ? "Create" : "Update"}
          </Button>
        </Form>
      )}
    </>
  );
};

const DocumentTableRow = ({ field, remove, index, form }: any) => {
  const [uploading, setUploading] = useState(false);
  const [uploadFieldKey, setUploadFieldKey] = useState(getRandomString());
  const allDocs = Form.useWatch("documents");
  const documentFileValue = Form.useWatch(
    ["documents", field.name, "file"],
    form
  );
  const documentFileBase64Value = Form.useWatch(
    ["documents", field.name, "fileBase64"],
    form
  );

  useEffect(() => {
    if (documentFileValue && typeof documentFileValue !== "string") {
      form.setFieldValue(["documents", field.name, "file"], undefined);
    }
  }, [documentFileValue]);

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
          form.setFieldValue(["documents", field.name, "file"], url);
          form.setFieldValue(
            ["documents", field.name, "fileBase64"],
            base64URL
          );
        })
        .finally(() => setUploading(false));
    }
  };

  return (
    <tr>
      <td>
        <Form.Item
          name={[field.name, "docName"]}
          validateTrigger={["onFocus", "onChange"]}
          rules={[
            { required: true, message: "Please type document name!" },
            ({}) => ({
              validator(_, value) {
                if (value) {
                  const sameDocNameExists = allDocs.find(
                    (el: any, elIndex: number) =>
                      el.docName.trim().toLowerCase() ===
                        value.trim().toLowerCase() && elIndex !== field.name
                  );
                  if (sameDocNameExists) {
                    return Promise.reject(
                      new Error("Same Document name already exists!")
                    );
                  }
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Input placeholder="Enter document name here" />
        </Form.Item>
      </td>
      <td style={{ paddingTop: "22px", textAlign: "center" }}>
        <Form.Item name={[field.name, "fileBase64"]} hidden />
        <Form.Item
          name={[field.name, "file"]}
          rules={[{ required: true, message: "Upload document!" }]}
        >
          {documentFileBase64Value ? (
            <div className={styles["doc-photo-field-div"]}>
              <img
                src={documentFileBase64Value}
                className={styles["photo-field"]}
              />
              <DeleteOutlined
                className={styles["photo-remove-icon"]}
                onClick={() => {
                  form.setFieldValue(
                    ["documents", field.name, "file"],
                    undefined
                  );
                  form.setFieldValue(
                    ["documents", field.name, "fileBase64"],
                    undefined
                  );
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
              className={styles["doc-file-upload"]}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          )}
        </Form.Item>
      </td>
      <td style={{ textAlign: "center" }}>
        <Button type="dashed" danger onClick={() => remove(index)}>
          Remove
        </Button>
      </td>
    </tr>
  );
};

export default StaffMemberForm;
