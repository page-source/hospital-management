import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button, Form, message, Row, Col, Select, Input } from "antd";

import api from "components/axios";
import { IBooking } from "interfaces/booking.interface";
import styles from "./styles/bookingDetail.module.scss";

const EditBooking = () => {
  const router = useRouter();
  const bookingId = router.query.id;
  const [form] = Form.useForm();

  const [details, setDetails] = useState<IBooking>();
  const [submitting, setSubmitting] = useState(false);

  const loadDetails = () => {
    api
      .get(`/pht/v1/api/bookings/${bookingId}`)
      .then((r) => {
        if (r.data.status !== "FAILURE") {
          setDetails({ ...r.data.data });
          form.setFieldsValue({ ...r.data.data });
        } else {
          message.error({
            content: r.data?.data || "Unable to fetch!",
            key: "booking",
            duration: 10,
          });
        }
      })
      .catch(console.log);
  };

  useEffect(() => {
    loadDetails();
  }, []);

  const onSubmit = (values: any) => {
    setSubmitting(true);
    const submitObj = {
      bookingId: values.bookingId,
      bookingStatus: values.bookingStatus,
      memberId: values.customerId,
      paymentRequest: {
        ...values.payment,
        amount: values.payment.amount,
        bookingId: values.bookingId,
        customerId: values.customerId,
        paymentStatus: values.payment.paymentStatus,
      },
    };

    api
      .put("/pht/v1/api/bookings", { ...submitObj })
      .then((createResp) => {
        if (createResp.data?.status !== "FAILURE") {
          message.success({
            content: "Updated Successfully",
            key: "booking",
            duration: 4,
          });
          router.push(`/booking/${createResp.data.data.bookingId}`);
        } else {
          message.error({
            content: createResp.data?.data || "Unable to update!",
            key: "booking",
            duration: 10,
          });
          setSubmitting(false);
        }
      })
      .catch((e) => {
        message.error({
          content: e.response?.data?.data || "Unable to update!",
          key: "booking",
          duration: 10,
        });
        console.log(e);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const hiddenStyles = {
    display: "none",
  };
  return (
    <>
      <h2 className={styles["main-title"]}>
        Edit Booking - {details?.bookingId}
      </h2>

      <Form
        name="booking"
        form={form}
        initialValues={details ? { ...details } : {}}
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
                label="Booking ID"
                name="bookingId"
                style={hiddenStyles}
              ></Form.Item>
              <Form.Item name="bookingStatus" style={hiddenStyles}></Form.Item>
              <Form.Item
                label="Booking ID"
                name="memberId"
                initialValue={details?.customerId}
                style={hiddenStyles}
              ></Form.Item>
              <Form.Item
                label="Customer"
                name="customerId"
                style={hiddenStyles}
              ></Form.Item>
              <Form.Item label="Customer" name="customerName">
                <Input disabled={true} value={details?.customerName}></Input>
              </Form.Item>
            </Col>
          </Row>
        </>
        <legend>Payment Details</legend>
        <>
          <Row gutter={24}>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                label="Amount"
                name={["payment", "amount"]}
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
                name={["payment", "paymentStatus"]}
                style={hiddenStyles}
              ></Form.Item>
              <Form.Item
                label="Updated At"
                name={["payment", "updatedAt"]}
                style={hiddenStyles}
              ></Form.Item>
              <Form.Item
                label="Updated At"
                name={["payment", "createdAt"]}
                style={hiddenStyles}
              ></Form.Item>

              <Form.Item
                label="Transaction ID"
                name={["payment", "transactionId"]}
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
                name={["payment", "paymentChannel"]}
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
        </>{" "}
        <Button type="primary" htmlType="submit" loading={submitting}>
          Update
        </Button>
      </Form>
    </>
  );
};

export default EditBooking;
