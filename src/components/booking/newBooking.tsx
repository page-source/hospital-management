import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import moment from "moment";
import {
  Button,
  DatePicker,
  Form,
  message,
  Row,
  Col,
  Select,
  TimePicker,
  Input,
  Radio,
  Checkbox,
} from "antd";

import api from "components/axios";
import { IService, IServiceQuestions } from "interfaces/service.interface";
import { ICustomer, IFamilyMember } from "interfaces/customer.interface";

import styles from "./styles/bookingDetail.module.scss";

const NewBooking = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const selectedCustomerId = Form.useWatch("customerId", form);
  const selectedServiceId = Form.useWatch("serviceId", form);

  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersList, setCustomersList] = useState<ICustomer[]>();
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesList, setServicesList] = useState<IService[]>();
  const [submitting, setSubmitting] = useState(false);
  const [membersList, setMemberList] = useState<IFamilyMember[]>([]);
  const [selectedService, setSelectedService] = useState<IService>();

  useEffect(() => {
    form.setFieldValue("bookingForMemberId", undefined);
    if (selectedCustomerId && customersList?.length) {
      setMemberList(
        customersList.find((el) => el.customerId === selectedCustomerId)
          ?.familyMembers || []
      );
    } else {
      setMemberList([]);
    }
  }, [selectedCustomerId, customersList]);

  useEffect(() => {
    form.setFieldValue("questionAnswerList", undefined);
    if (selectedServiceId && servicesList?.length) {
      setSelectedService(
        servicesList.find((el) => el.serviceId === selectedServiceId)
      );
    } else {
      setSelectedService(undefined);
    }
  }, [selectedServiceId, servicesList]);

  const fetchCustomersList = () => {
    setCustomersLoading(true);
    api
      .get("/pht/v1/api/customers", { params: { limit: 10000, page: 0 } })
      .then((r) => setCustomersList(r.data?.data?.customers || []))
      .catch(console.log)
      .finally(() => setCustomersLoading(false));
  };

  const fetchServicesList = () => {
    setServicesLoading(true);
    api
      .get("/pht/v1/api/service", { params: { limit: 10000, page: 0 } })
      .then((r) => setServicesList(r.data?.data?.services || []))
      .catch(console.log)
      .finally(() => setServicesLoading(false));
  };

  useEffect(() => {
    fetchCustomersList();
    fetchServicesList();
  }, []);

  const onSubmit = (values: any) => {
    setSubmitting(true);
    api
      .post("/pht/v1/api/bookings", {
        bookingStatus: "PENDING_FOR_PAYMENT",
        customerId: values.customerId,
        bookingForMemberId: values.bookingForMemberId,
        serviceId: values.serviceId,
        slotDate: values.slotDate.format("YYYY-MM-DD"),
        slotTime: values.slotTime.format("hh:mm A"),
        workflowName: values.workflowName,
        questionAnswerList:
          values.questionAnswerList?.map(
            (el: IServiceQuestions, index: number) => ({
              ...selectedService?.questions[index],
              answer: Array.isArray(el.answer)
                ? el.answer.join(", ")
                : el.answer,
            })
          ) || [],
      })
      .then((createResp) => {
        if (createResp.data?.status !== "FAILURE") {
          api
            .put("/pht/v1/api/bookings", {
              bookingId: createResp.data.data.bookingId,
              bookingStatus: "APPROVED",
              paymentRequest: {
                customerId: values.customerId,
                bookingId: createResp.data.data.bookingId,
                amount: Number(values.amount),
                transactionId: values.transactionId,
                paymentChannel: values.paymentChannel,
                paymentStatus: "COMPLETED",
              },
            })
            .then((updateResp) => {
              if (updateResp.data?.status !== "FAILURE") {
                message.success({
                  content: "Created Successfully",
                  key: "booking",
                  duration: 4,
                });
              } else {
                message.error({
                  content: updateResp.data?.data || "Unable to add payment!",
                  key: "booking",
                  duration: 4,
                });
              }
            })
            .catch((e) => {
              message.error({
                content: e.response?.data?.data || "Unable to add payment!",
                key: "booking",
                duration: 4,
              });
              console.log(e);
            })
            .finally(() => {
              setSubmitting(false);
              router.push(`/booking/${createResp.data.data.bookingId}`);
            });
        } else {
          message.error({
            content: createResp.data?.data || "Unable to create!",
            key: "booking",
            duration: 4,
          });
          setSubmitting(false);
        }
      })
      .catch((e) => {
        console.log(e);
        setSubmitting(false);
      });
  };

  return (
    <>
      <h2 className={styles["main-title"]}>Create New Booking</h2>

      <Form
        name="booking"
        form={form}
        initialValues={{}}
        labelCol={{ span: 24 }}
        requiredMark={false}
        disabled={submitting}
        onFinish={onSubmit}
      >
        <legend>Basic Details</legend>
        <>
          <Row gutter={24}>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                label="Customer"
                name="customerId"
                rules={[{ required: true, message: "Please select customer" }]}
              >
                <Select
                  showSearch
                  placeholder="Select Customer"
                  loading={customersLoading}
                  optionFilterProp="label"
                  options={customersList?.map((el) => ({
                    label: `${el.firstName || ""} ${el.lastName || ""} (${
                      el.emailId || "--"
                    })`,
                    value: el.customerId,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12} lg={8}>
              <Form.Item
                label="Patient"
                name="bookingForMemberId"
                rules={[{ required: true, message: "Please select patient" }]}
              >
                <Select
                  showSearch
                  placeholder="Select Patient"
                  disabled={!selectedCustomerId}
                  loading={customersLoading}
                  optionFilterProp="label"
                  options={membersList?.map((el) => ({
                    label: `${el.firstName || ""} ${el.lastName || ""} (${
                      el.relation || "--"
                    })`,
                    value: el.memberId,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                label="Slot Date"
                name="slotDate"
                rules={[{ required: true, message: "Please select slot date" }]}
              >
                <DatePicker
                  placeholder="Select Slot Date"
                  format="DD-MMM-YYYY"
                  style={{ width: "100%" }}
                  disabledDate={(dateEl) => dateEl < moment()}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                label="Slot Time"
                name="slotTime"
                rules={[{ required: true, message: "Please select slot time" }]}
              >
                <TimePicker
                  placeholder="Select Slot Time"
                  format="hh:mm A"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                label="Workflow Name"
                name="workflowName"
                rules={[
                  { required: true, message: "Please type Workflow Name" },
                ]}
              >
                <Select
                  placeholder="Select Workflow"
                  optionFilterProp="label"
                  options={[
                    { value: "CARE_GIVER" },
                    { value: "PHYSIO" },
                    { value: "MENTAL_WELLNESS" },
                    { value: "NURSING" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </>

        <legend>Service Details</legend>
        <>
          <Row gutter={24}>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                label="Service"
                name="serviceId"
                rules={[{ required: true, message: "Please select service" }]}
              >
                <Select
                  showSearch
                  placeholder="Select Service"
                  loading={servicesLoading}
                  optionFilterProp="label"
                  options={servicesList?.map((el) => ({
                    label: el.name,
                    value: el.serviceId,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {selectedService && (
            <div
              className={styles["table-wrapper-2"]}
              style={{ marginBottom: "20px" }}
            >
              <Form.List name="questionAnswerList">
                {(fields, {}) => (
                  <div className="flex gap-2">
                    <table>
                      <colgroup>
                        <col style={{ width: 250 }} />
                        <col style={{ width: 150 }} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>Question</th>
                          <th>Answer</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedService.questions.map((el, elIndex) => (
                          <tr key={el.questionId}>
                            <td>{el.questionContent}</td>
                            <td>
                              {el.questionType === "FREE_TEXT" && (
                                <Form.Item
                                  style={{ marginBottom: 0 }}
                                  name={[elIndex, "answer"]}
                                  rules={[
                                    {
                                      whitespace: true,
                                      required: true,
                                      message: "Please enter answer!",
                                    },
                                  ]}
                                >
                                  <Input placeholder="Type Answer" />
                                </Form.Item>
                              )}
                              {el.questionType === "SINGLE_CHOICE" && (
                                <Form.Item
                                  style={{ marginBottom: 0 }}
                                  name={[elIndex, "answer"]}
                                  rules={[
                                    {
                                      required: true,
                                      message: "Please select answer!",
                                    },
                                  ]}
                                >
                                  <Radio.Group>
                                    {el.possibleAnswers?.map(
                                      (possibleAns, possibleAnsIndex) => (
                                        <Radio
                                          value={possibleAns}
                                          key={possibleAnsIndex}
                                        >
                                          {possibleAns}
                                        </Radio>
                                      )
                                    )}
                                  </Radio.Group>
                                </Form.Item>
                              )}
                              {el.questionType === "MULTI_CHOICE" && (
                                <Form.Item
                                  name={[elIndex, "answer"]}
                                  style={{ marginBottom: 0 }}
                                  rules={[
                                    {
                                      required: true,
                                      type: "array",
                                      message:
                                        "Please select atleast one answer!",
                                    },
                                  ]}
                                >
                                  <Checkbox.Group>
                                    <Row gutter={24}>
                                      {el.possibleAnswers?.map(
                                        (possibleAns, possibleAnsIndex) => (
                                          <Col xs={12} key={possibleAnsIndex}>
                                            <Checkbox value={possibleAns}>
                                              {possibleAns}
                                            </Checkbox>
                                          </Col>
                                        )
                                      )}
                                    </Row>
                                  </Checkbox.Group>
                                </Form.Item>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Form.List>
            </div>
          )}
        </>

        <legend>Payment Details</legend>
        <>
          <Row gutter={24}>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                label="Amount"
                name="amount"
                rules={[
                  {
                    required: false,
                    message: "Please enter amount",
                  },
                  () => ({
                    validator(_, value) {
                      if (value && Number(value) <= 0) {
                        return Promise.reject(
                          new Error("Please enter valid amount!")
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input placeholder="Enter amount" type="number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                label="Transaction ID"
                name="transactionId"
                rules={[
                  {
                    required: false,
                    message: "Please enter Transaction ID",
                  },
                ]}
              >
                <Input placeholder="Enter Transaction ID" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                label="Payment Channel"
                name="paymentChannel"
                rules={[
                  {
                    required: false,
                    message: "Please enter Payment Channel",
                  },
                ]}
              >
                <Select
                  placeholder="Select Payment Channel"
                  options={[{ label: "Razorpay", value: "RAZOR_PAY" }]}
                />
              </Form.Item>
            </Col>
          </Row>
        </>

        <Button type="primary" htmlType="submit" loading={submitting}>
          Create
        </Button>
      </Form>
    </>
  );
};

export default NewBooking;
