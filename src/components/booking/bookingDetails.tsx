import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button, Dropdown, Form, message, Modal, Select, Spin } from "antd";
import { ArrowLeftOutlined, LinkOutlined } from "@ant-design/icons";
import moment from "moment";
import { getBase64FromURL } from "commonFunctions/upload-helper";

import MenuIcon from "assets/menu.svg";
import api from "components/axios";
import { IBooking } from "interfaces/booking.interface";
import { IStaffMember } from "interfaces/staff-member.interface";

import styles from "./styles/bookingDetail.module.scss";

interface IStatusChangeState {
  type: "cancelled" | "completed";
  loading: boolean;
}

const BookingDetails = () => {
  const [form] = Form.useForm();
  let refreshInterval: NodeJS.Timeout;
  const router = useRouter();
  const bookingId = router.query.id;

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<IBooking>();
  const [approvingStaffMemberId, setApprovingStaffMemberId] =
    useState<string>("");
  const [staffMembers, setStaffMembers] = useState<IStaffMember[]>();

  const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false);
  const [assigningBooking, setAssigningBooking] = useState(false);
  const [changingStatus, setChangingStatus] = useState<IStatusChangeState>();

  const loadDetails = () => {
    api
      .get(`/pht/v1/api/bookings/${bookingId}`)
      .then(async (r) => {
        if (r.data.status !== "FAILURE") {
          const obj = r.data?.data || {};
          if (
            obj.prescriptionFilePaths.length > 0 &&
            obj.prescriptionFilePaths[0]
          ) {
            obj.prescriptionBase64 = await getBase64FromURL(
              obj.prescriptionFilePaths[0]
            );
          }
          setDetails(obj);
        } else {
          message.error({
            content: r.data?.data || "Unable to fetch!",
            key: "booking",
            duration: 10,
          });
        }
      })
      .catch(console.log)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api
      .get("/pht/v1/api/staff/")
      .then((r) => setStaffMembers(r.data?.data?.staffList || []))
      .catch(console.log);
  }, []);

  useEffect(() => {
    if (bookingId) {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      refreshInterval = setInterval(loadDetails, 10000);
      loadDetails();
    }
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [bookingId]);

  function approveBooking(staffId: string) {
    setApprovingStaffMemberId(staffId);
    api
      .get("/pht/v1/api/bookings/action/approve-invitation", {
        params: { booking_id: bookingId, care_giver_id: staffId },
      })
      .then((r) => {
        if (r.data?.status !== "FAILURE") {
          message.success({
            content: "Updated successfully!",
            key: "booking",
            duration: 4,
          });
          loadDetails();
        } else {
          message.error({
            content: r.data.data || "Unable to update!",
            key: "booking",
            duration: 10,
          });
        }
      })
      .catch(console.log)
      .finally(() => setApprovingStaffMemberId(""));
  }

  const markAsCompleted = () => {
    setChangingStatus({
      loading: true,
      type: "completed",
    });
    api
      .get(`/pht/v1/api/bookings/action/mark-complete?booking_id=${bookingId}`)
      .then((r) => {
        if (r.data?.status !== "FAILURE") {
          loadDetails();
          message.success({
            content: "Marked as Completed successfully!",
            key: "bookings",
            duration: 4,
          });
        } else {
          message.error({
            content: r.data.data || "Failed in marking as completed!",
            key: "bookings",
            duration: 10,
          });
        }
      })
      .catch(console.log)
      .finally(() => setChangingStatus(undefined));
  };

  const markAsCancelled = () => {
    setChangingStatus({
      loading: true,
      type: "cancelled",
    });
    api
      .get(`/pht/v1/api/bookings/action/mark-cancel?booking_id=${bookingId}`)
      .then((r) => {
        loadDetails();
        if (r.data?.status !== "FAILURE") {
          message.success({
            content: "Marked as cancelled successfully!",
            key: "bookings",
            duration: 4,
          });
        } else {
          message.error({
            content: r.data.data || "Failed in marking as cancelled!",
            key: "bookings",
            duration: 10,
          });
        }
      })
      .catch(console.log)
      .finally(() => setChangingStatus(undefined));
  };

  const assignBooking = (values: any) => {
    setAssigningBooking(true);
    api
      .post(`/pht/v1/api/bookings/action/assign-to-staff`, {
        bookingId: details?.bookingId,
        staffId: values.staffId,
      })
      .then((r) => {
        if (r.data?.status !== "FAILURE") {
          loadDetails();
          message.success({
            content: "Booking assigned successfully!",
            key: "bookings",
            duration: 4,
          });
          form.resetFields();
          setIsAssigneeModalOpen(false);
        } else {
          message.error({
            content: r.data.data || "Failed in assigning booking!",
            key: "bookings",
            duration: 10,
          });
        }
      })
      .catch(console.log)
      .finally(() => {
        setAssigningBooking(false);
      });
  };

  function imageOpen(event: any) {
    event.preventDefault;
    const widthWindow = window?.visualViewport?.width || 768;

    const src = event.target.src;
    var newTab = window.open();
    const ifMobile = window.innerWidth < 540;
    setTimeout(function () {
      if (newTab)
        newTab.document.body.innerHTML = `<img src=${src} alt="Prescription Photo" style='width:${
          ifMobile ? widthWindow : widthWindow / 2
        }'/>`;
    }, 5);

    return false;
  }
  return (
    <>
      <div className="flex justify-between mb-4">
        <Link href="/booking">
          <a className="flex items-center gap-2">
            <ArrowLeftOutlined />
            <i className="font-medium">Back to Bookings List</i>
          </a>
        </Link>

        <div className="flex gap-4 items-start">
          <Link href={`/booking-public-page/${bookingId}`} target="_blank">
            <a className="flex items-center gap-2" target="_blank">
              <LinkOutlined />
              <span>Go to Public Page</span>
            </a>
          </Link>
          <Dropdown
            arrow
            placement="bottomLeft"
            menu={{
              items: details
                ? [
                    {
                      key: "assign",
                      label: <div>Assign Staff Member</div>,
                      onClick: () => setIsAssigneeModalOpen(true),
                    },
                    {
                      key: "complete",
                      label: <div>Mark As Completed</div>,
                      onClick: () =>
                        setChangingStatus({
                          type: "completed",
                          loading: false,
                        }),
                    },
                    {
                      key: "cancel",
                      label: <div>Mark As Cancelled</div>,
                      onClick: () =>
                        setChangingStatus({
                          type: "cancelled",
                          loading: false,
                        }),
                    },
                  ]
                : [],
            }}
          >
            <Image
              src={MenuIcon}
              style={{ cursor: "pointer" }}
              layout="fixed"
              id="options-wrapper"
            />
          </Dropdown>
        </div>
      </div>

      <h2 className={styles["main-title"]}>Booking Detail</h2>

      {loading ? (
        <div className="text-center">
          <Spin />
        </div>
      ) : (
        <>
          <div className="flex pb-2">
            <div className={styles["field-title"]}>Booking ID :</div>
            <div>{bookingId}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>FieldEZ ID :</div>
            <div>{details?.fieldEZTicketNumber || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Booking Date :</div>
            <div>{details?.createdAtStr || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Slot Date :</div>
            <div>
              {details?.slotDate ? (
                <>
                  {moment(details.slotDate, "YYYY-MM-DD").format(
                    "DD MMM, YYYY"
                  )}{" "}
                  {moment(details.slotTime, "HH:mm").format("hh:mm A")}
                </>
              ) : (
                "--"
              )}
            </div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Customer Name :</div>
            <div>
              {details?.customerName || "--"} (
              {details?.customerEmailId || "--"})
            </div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Patient :</div>
            <div>
              {details?.bookingForMember ? (
                <>
                  {details.bookingForMember.firstName || ""}{" "}
                  {details.bookingForMember.lastName || ""} (
                  {details?.bookingForMember.relation || "--"})
                </>
              ) : (
                "--"
              )}
            </div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Patient Phone :</div>
            <div>{details?.bookingForMember?.phoneNumber || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Patient Gender :</div>
            <div>{details?.bookingForMember?.gender || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Patient DOB :</div>
            <div>{details?.bookingForMember?.dob || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Staff Member :</div>
            <div>
              {details?.bookingAssigneeDetails ? (
                <>
                  {details.bookingAssigneeDetails.name || "--"} (
                  {details.bookingAssigneeDetails.emailId || "--"})
                </>
              ) : (
                "--"
              )}
            </div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Service Name :</div>
            <div>{details?.serviceName || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Booking Status :</div>
            <div>{details?.bookingStatusStr || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>
              Total Invitations Sent :
            </div>
            <div>{details?.totalInvitationsSent || 0}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>
              Total Invitations Accepted :
            </div>
            <div>{details?.totalInvitationsAccepted || 0}</div>
          </div>

          <div
            className={`flex ${
              details?.questionAnswerList?.length ? "pb-4 pt-4" : "pb-2"
            }`}
          >
            <div className={styles["field-title"]}>Question Answers :</div>
            <div className={styles["table-wrapper"]}>
              {details?.questionAnswerList?.length ? (
                <table>
                  <thead>
                    <tr>
                      <th>Question</th>
                      <th>Answer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.questionAnswerList.map((el) => (
                      <tr key={el.questionId}>
                        <td>{el.questionContent || "--"}</td>
                        <td>{el.answer || "--"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                "--"
              )}
            </div>
          </div>

          <div className={`flex ${details?.payment ? "pb-4 pt-4" : "pb-2"}`}>
            <div className={styles["field-title"]}>Payment Details :</div>
            <div className={styles["table-wrapper"]}>
              {details?.payment ? (
                <table>
                  <thead>
                    <tr>
                      <th>Payment Id</th>
                      <th>Transaction Id</th>
                      <th>Status</th>
                      <th>Channel</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{details.payment.paymentId || "--"}</td>
                      <td>{details.payment.transactionId || "--"}</td>
                      <td>{details.payment.paymentStatus || "--"}</td>
                      <td>{details.payment.paymentChannel || "--"}</td>
                      <td>
                        {details.payment.amount
                          ? `₹ ${details.payment.amount}`
                          : "--"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                "--"
              )}
            </div>
          </div>

          <div
            className={`flex ${
              details?.bookingInvitations?.length ? "pb-4 pt-4" : "pb-2"
            }`}
          >
            <div className={styles["field-title"]}>Booking Invitations :</div>
            <div className={styles["table-wrapper"]}>
              {details?.bookingInvitations?.length === 0 ? (
                "--"
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Staff Member Name</th>
                      <th>Staff Member Email Id</th>
                      <th>Staff Member Phone Number</th>
                      <th>Booking Invitation Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details?.bookingInvitations.map((el) => (
                      <tr key={el.staffId}>
                        <td>{el.staffName || "--"}</td>
                        <td>{el.staffEmail || "--"}</td>
                        <td>{el.staffMobileNumber || "--"}</td>
                        <td>{el.bookingInvitationStatus}</td>
                        <td>
                          {el.bookingInvitationStatus === "ACCEPTED" &&
                          details.bookingStatus === "ASSIGNED" ? (
                            <Button
                              type="primary"
                              onClick={() => approveBooking(el.staffId)}
                              loading={approvingStaffMemberId === el.staffId}
                              disabled={!!approvingStaffMemberId}
                            >
                              Approve
                            </Button>
                          ) : (
                            <div className="text-center">--</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Prescription :</div>

            {details?.prescriptionBase64 ? (
              <a href="#" onClick={(event) => imageOpen(event)}>
                <img
                  src={details.prescriptionBase64}
                  className={styles["photo"]}
                  alt="Prescription Photo"
                />
              </a>
            ) : (
              "--"
            )}
          </div>
        </>
      )}

      <Modal
        title="Assign Staff Member"
        open={!!isAssigneeModalOpen}
        onOk={form.submit}
        okButtonProps={{ disabled: !!assigningBooking }}
        onCancel={() => {
          form.resetFields();
          setIsAssigneeModalOpen(false);
          setAssigningBooking(false);
        }}
      >
        <Form
          name="assign"
          form={form}
          labelCol={{ span: 24 }}
          onFinish={assignBooking}
        >
          <Form.Item
            label="Staff Member"
            name="staffId"
            rules={[{ required: true, message: "Staff Member is required!" }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Select Staff Member"
              options={staffMembers?.map((el) => ({
                label: `${el.employeeName} (${el.emailId})`,
                value: el.staffId,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Change Status"
        open={!!changingStatus}
        onOk={() => {
          if (changingStatus?.type === "cancelled") {
            markAsCancelled();
          } else if (changingStatus?.type === "completed") {
            markAsCompleted();
          }
        }}
        okButtonProps={{ loading: changingStatus?.loading }}
        onCancel={() => setChangingStatus(undefined)}
      >
        Are you sure to mark this booking ({details?.bookingId}) as{" "}
        {changingStatus?.type}?
      </Modal>
    </>
  );
};

export default BookingDetails;
