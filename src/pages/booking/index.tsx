import { useEffect, useRef, useState } from "react";
import {
  Button,
  Dropdown,
  Form,
  message,
  Modal,
  Radio,
  Select,
  Switch,
  Table,
  Tooltip,
} from "antd";
import Image from "next/image";
import { useRouter } from "next/router";
import { CloseCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/lib/table";
import moment from "moment";

import { IBooking, IBookingPayment } from "interfaces/booking.interface";
import { IStaffMember } from "interfaces/staff-member.interface";
import { IPagination } from "interfaces/common.interface";
import api from "components/axios";
import Container from "components/Container";
import MenuIcon from "assets/menu.svg";

import styles from "./styles/booking.module.scss";

interface IStatusChangeState {
  type: "cancelled" | "completed";
  id: string;
  loading: boolean;
}

interface IDetailSectionProps {
  selectedBooking?: IBooking;
  setSelectedBooking: (obj: IBooking | undefined) => void;
}

const getRandomString = () => Math.random().toString();

const BookingsPage = () => {
  const [typeFilter, setTypeFilter] = useState("ALL");
  let refreshInterval: NodeJS.Timeout;
  const [form] = Form.useForm();
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [bookingsList, setBookingsList] = useState<IBooking[]>([]);
  const [staffMembers, setStaffMembers] = useState<IStaffMember[]>();
  const [changingStatus, setChangingStatus] = useState<IStatusChangeState>();
  // const [deletingList, setDeletingList] = useState<string[]>([]);
  const [refreshTS, setRefreshTS] = useState(getRandomString());
  const [selectedBooking, setSelectedBooking] = useState<IBooking>();
  const [isAutoRefreshOn, setIsAutoRefreshOn] = useState(true);
  const [assigningBooking, setAssigningBooking] = useState({
    id: "",
    loading: false,
  });
  const [pagination, setPagination] = useState<IPagination>({
    current: 0,
    pageSize: 25,
    total: 0,
  });

  useEffect(() => {
    api
      .get("/pht/v1/api/staff")
      .then((r) => setStaffMembers(r.data?.data?.staffList || []))
      .catch(console.log);
  }, []);

  useEffect(() => {
    if (selectedBooking && !selectedBooking.isRead) {
      api
        .get("/pht/v1/api/bookings/action/mark-read", {
          params: { booking_id: selectedBooking.bookingId },
        })
        .then((r) => {
          if (r.data?.status === "SUCCESS") {
            const tempArr = [...bookingsList];
            const index = tempArr.findIndex(
              (el) => el.bookingId === selectedBooking.bookingId
            );
            if (index > -1) {
              tempArr[index].isRead = true;
              setBookingsList([...tempArr]);
            }
          }
        })
        .catch(console.log);
    }
  }, [selectedBooking]);

  const getBookings = () => {
    setLoading(true);
    api
      .get(`/pht/v1/api/bookings`, {
        params: {
          limit: pagination.pageSize,
          page: pagination.current,
          booking_filter: typeFilter,
        },
      })
      .then((r) => {
        const arr = r.data?.data?.bookings || [];
        setBookingsList(arr);
        if (
          selectedBooking &&
          !arr.find(
            (el: IBooking) => el.bookingId === selectedBooking.bookingId
          )
        ) {
          setSelectedBooking(undefined);
        }
        setPagination((prev) => ({
          ...prev,
          total: r.data?.data?.totalItems || 0,
        }));
      })
      .catch(console.log)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    if (isAutoRefreshOn) {
      refreshInterval = setInterval(getBookings, 10000);
    }
    getBookings();
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [pagination.current, pagination.pageSize, isAutoRefreshOn]);

  useEffect(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    if (isAutoRefreshOn) {
      refreshInterval = setInterval(getBookings, 10000);
    }
    if (pagination.current === 0) {
      getBookings();
    } else {
      setPagination({ ...pagination, current: 0 });
    }
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [typeFilter]);

  const markAsCompleted = (bookingId: string) => {
    setChangingStatus({
      id: bookingId,
      loading: true,
      type: "completed",
    });
    api
      .get(`/pht/v1/api/bookings/action/mark-complete?booking_id=${bookingId}`)
      .then((r) => {
        if (r.data?.status !== "FAILURE") {
          getBookings();
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

  const markAsCancelled = (bookingId: string) => {
    setChangingStatus({
      id: bookingId,
      loading: true,
      type: "cancelled",
    });
    api
      .get(`/pht/v1/api/bookings/action/mark-cancel?booking_id=${bookingId}`)
      .then((r) => {
        getBookings();
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
    setAssigningBooking((prev) => ({ ...prev, loading: true }));
    api
      .post(`/pht/v1/api/bookings/action/assign-to-staff`, {
        bookingId: assigningBooking.id,
        staffId: values.staffId,
      })
      .then((r) => {
        if (r.data?.status !== "FAILURE") {
          getBookings();
          message.success({
            content: "Booking assigned successfully!",
            key: "bookings",
            duration: 4,
          });
          form.resetFields();
          setAssigningBooking({ id: "", loading: false });
        } else {
          setAssigningBooking((prev) => ({ ...prev, loading: false }));
          message.error({
            content: r.data.data || "Failed in assigning booking!",
            key: "bookings",
            duration: 10,
          });
        }
      })
      .catch(console.log);
  };

  const columns: ColumnsType<IBooking> = [
    {
      title: "Customer Name",
      dataIndex: "customerName",
      width: 200,
      render: (val: string, record: IBooking) =>
        val ? (
          <>
            {val}
            <div style={{ wordBreak: "break-all" }}>
              ({record.customerEmailId})
            </div>
          </>
        ) : (
          "--"
        ),
    },
    {
      title: "Patient",
      dataIndex: "bookingForMember",
      width: 175,
      render: (val, record: IBooking) =>
        val ? (
          <>
            {record.bookingForMember ? (
              <>
                {record.bookingForMember.firstName || ""}{" "}
                {record.bookingForMember.lastName || ""}
                <div style={{ wordBreak: "break-all" }}>
                  ({record.bookingForMember.relation})
                </div>
              </>
            ) : (
              "--"
            )}
          </>
        ) : (
          "--"
        ),
    },
    {
      title: "Service Name",
      dataIndex: "serviceName",
      width: 125,
      render: (val: string) => val || "--",
    },
    {
      title: "Booking ID",
      dataIndex: "bookingId",
      width: 150,
      render: (val: string) => <span>{val}</span> || "--",
    },
    {
      title: "FieldEZ Id",
      dataIndex: "fieldEZTicketNumber",
      width: 100,
      render: (val: string) => val || "--",
    },
    {
      title: "Staff Member Name",
      dataIndex: "bookingAssigneeDetails",
      width: 210,
      render: (data) =>
        data ? (
          <>
            {data.name}
            <div style={{ wordBreak: "break-all" }}>
              ({data.emailId || "--"})
            </div>
          </>
        ) : (
          "--"
        ),
    },
    {
      title: "Amount",
      key: "payment_amount",
      width: 90,
      dataIndex: "payment",
      render: (data: IBookingPayment) =>
        data?.amount || data?.amount === 0 ? `₹ ${data.amount}` : "--",
    },
    {
      title: "Status",
      dataIndex: "bookingStatusStr",
      width: 130,
      render: (val: string) => val || "--",
    },
    {
      title: "Invitations",
      dataIndex: "totalInvitationsSent",
      width: 200,
      render: (val: number, record: IBooking) => (
        <>
          <div className="flex gap-1">
            <div className={styles["invitation-col-title"]}>
              Total Invitations:
            </div>
            <div>{record.totalInvitationsSent || 0}</div>
          </div>
          <div className="flex gap-1">
            <div className={styles["invitation-col-title"]}>
              Accepted Invitations:
            </div>
            <div>{record.totalInvitationsAccepted || 0}</div>
          </div>
        </>
      ),
    },
    {
      title: "Last updated at",
      dataIndex: "updatedAtStr",
      width: 190,
      render: (val: string) => val || "--",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      width: 80,
      fixed: "right",
      render: (val: any, record: IBooking) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "edit-details",
                label: <div id="options-edit-details">Edit Details</div>,
                onClick: () =>
                  router.push(
                    `${router.pathname}/${record.bookingId}?edit=true`
                  ),
              },
              {
                key: "view-details",
                label: <div id="options-view-details">View Details</div>,
                onClick: () => setSelectedBooking(record),
              },
              {
                key: "assign",
                label: (
                  <div id="options-assign-staff-member">
                    Assign Staff Member
                  </div>
                ),
                onClick: () =>
                  setAssigningBooking({
                    id: record.bookingId,
                    loading: false,
                  }),
              },
              {
                key: "complete",
                label: <div id="options-mark-completed">Mark As Completed</div>,
                onClick: () =>
                  setChangingStatus({
                    type: "completed",
                    id: record.bookingId,
                    loading: false,
                  }),
              },
              {
                key: "cancel",
                label: <div id="options-mark-cancelled">Mark As Cancelled</div>,
                onClick: () =>
                  setChangingStatus({
                    type: "cancelled",
                    id: record.bookingId,
                    loading: false,
                  }),
              },
            ],
          }}
        >
          <Image
            src={MenuIcon}
            style={{ cursor: "pointer" }}
            layout="fixed"
            id="options-wrapper"
          />
        </Dropdown>
      ),
    },
  ];
  const typeOptions = [
    { label: "All", value: "ALL" },
    { label: "New", value: "NEW_BOOKINGS" },
    { label: "Approved", value: "APPROVED" },
  ];
  const mobileDevice = window.innerWidth < 560;
  return (
    <Container
      extraContent={
        <div style={{ marginLeft: "auto" }}>
          <label className="mr-2">Auto Refresh?</label>
          <Switch checked={isAutoRefreshOn} onChange={setIsAutoRefreshOn} />
        </div>
      }
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          gap: 15,
          marginBottom: 10,
        }}
        className={styles["booking-menu"]}
      >
        <div className="flex items-center gap-2">
          {!mobileDevice && <div>Type:</div>}
          {mobileDevice ? (
            <Select
              defaultValue={typeFilter}
              style={{ width: 105 }}
              onChange={setTypeFilter}
              options={typeOptions}
            />
          ) : (
            <Radio.Group
              options={typeOptions}
              onChange={({ target }) => setTypeFilter(target.value)}
              value={typeFilter}
              optionType="button"
              buttonStyle="solid"
            />
          )}
        </div>

        <div className="flex gap-3">
          <Button
            type="primary"
            onClick={() => router.push(`${router.pathname}/new`)}
          >
            {window.innerWidth > 560 ? "Add New Booking" : "+ Booking"}
          </Button>

          <Tooltip title="Refresh">
            <Button
              type="dashed"
              disabled={isAutoRefreshOn}
              onClick={() => setRefreshTS(getRandomString())}
            >
              <ReloadOutlined style={{ verticalAlign: "text-top" }} />
            </Button>
          </Tooltip>
        </div>
      </div>

      <div
        className={`${styles["list-detail-wrapper"]} ${
          selectedBooking ? styles["list-with-detail"] : ""
        }`}
      >
        <div
          ref={wrapperRef}
          className={`bg-white border border-gray-300 ${styles["list-section"]}`}
        >
          <Table
            rowKey={(row) => row.bookingId}
            columns={columns}
            dataSource={bookingsList}
            loading={loading}
            scroll={{
              x: wrapperRef.current?.clientWidth,
              y: `calc(100vh - 252px)`,
            }}
            onRow={(record) => ({
              className: !record.isRead ? "table-row-unread" : "",
              onClick: (e: any) => {
                if (!e.target?.id.startsWith("options-")) {
                  setSelectedBooking(record);
                }
              },
            })}
            pagination={{
              current: pagination.current + 1,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              onChange(page, pageSize) {
                setPagination((prev) => ({
                  ...prev,
                  current: page - 1,
                  pageSize: pageSize,
                }));
              },
            }}
          />
        </div>
        <DetailSection
          selectedBooking={selectedBooking}
          setSelectedBooking={setSelectedBooking}
        />
      </div>

      <Modal
        title="Assign Staff Member"
        open={!!assigningBooking.id}
        onOk={form.submit}
        okButtonProps={{ disabled: assigningBooking.loading }}
        onCancel={() => {
          form.resetFields();
          setAssigningBooking({ id: "", loading: false });
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
            markAsCancelled(changingStatus.id);
          } else if (changingStatus?.type === "completed") {
            markAsCompleted(changingStatus.id);
          }
        }}
        okButtonProps={{ loading: changingStatus?.loading }}
        onCancel={() => setChangingStatus(undefined)}
      >
        Are you sure to mark this booking ({changingStatus?.id}) as{" "}
        {changingStatus?.type}?
      </Modal>
    </Container>
  );
};

const DetailSection = ({
  selectedBooking,
  setSelectedBooking,
}: IDetailSectionProps) => {
  const router = useRouter();

  return (
    <div
      className={`bg-white border border-gray-300 pt-6 pl-4 pb-4 pr-4 ${styles["detail-section"]}`}
    >
      <div className="flex justify-between">
        <h2 className={styles["detail-wrapper-title"]}>Booking Details</h2>

        <div className="flex gap-4">
          <a
            href={`${router.pathname}/${selectedBooking?.bookingId}`}
            target="_blank"
            className="mt-1 pointer link font-medium"
          >
            More Details
          </a>
          <CloseCircleOutlined
            onClick={() => setSelectedBooking(undefined)}
            className="mt-2"
            style={{ fontSize: 18 }}
          />
        </div>
      </div>

      <div className="flex pb-2">
        <div className={styles["field-title"]}>Booking ID :</div>
        <div>{selectedBooking?.bookingId}</div>
      </div>

      <div className="flex pb-2">
        <div className={styles["field-title"]}>FieldEZ ID :</div>
        <div>{selectedBooking?.fieldEZTicketNumber || "--"}</div>
      </div>

      <div className="flex pb-2">
        <div className={styles["field-title"]}>Booking Date :</div>
        <div>{selectedBooking?.createdAtStr || "--"}</div>
      </div>

      <div className="flex pb-2">
        <div className={styles["field-title"]}>Slot Date :</div>
        <div>
          {selectedBooking?.slotDate ? (
            <>
              {moment(selectedBooking.slotDate, "YYYY-MM-DD").format(
                "DD MMM, YYYY"
              )}{" "}
              {moment(selectedBooking.slotTime, "HH:mm").format("hh:mm A")}
            </>
          ) : (
            "--"
          )}
        </div>
      </div>

      <div className="flex pb-2">
        <div className={styles["field-title"]}>Customer Name :</div>
        <div>
          {selectedBooking?.customerName || "--"} (
          {selectedBooking?.customerEmailId || "--"})
        </div>
      </div>

      <div className="flex pb-2">
        <div className={styles["field-title"]}>Patient :</div>
        <div>
          {selectedBooking?.bookingForMember ? (
            <>
              {selectedBooking.bookingForMember.firstName || ""}{" "}
              {selectedBooking.bookingForMember.lastName || ""} (
              {selectedBooking?.bookingForMember.relation || "--"})
            </>
          ) : (
            "--"
          )}
        </div>
      </div>

      <div className="flex pb-2">
        <div className={styles["field-title"]}>Patient Phone :</div>
        <div>{selectedBooking?.bookingForMember?.phoneNumber || "--"}</div>
      </div>

      <div className="flex pb-2">
        <div className={styles["field-title"]}>Staff Member :</div>
        <div>
          {selectedBooking?.bookingAssigneeDetails ? (
            <>
              {selectedBooking.bookingAssigneeDetails.name || "--"} (
              {selectedBooking.bookingAssigneeDetails.emailId || "--"})
            </>
          ) : (
            "--"
          )}
        </div>
      </div>

      <div className="flex pb-2">
        <div className={styles["field-title"]}>Service Name :</div>
        <div>{selectedBooking?.serviceName || "--"}</div>
      </div>

      <div className="flex pb-2">
        <div className={styles["field-title"]}>Booking Status :</div>
        <div>{selectedBooking?.bookingStatusStr || "--"}</div>
      </div>

      <div className="flex pb-2">
        <div className={styles["field-title"]}>Invitations Sent :</div>
        <div>{selectedBooking?.totalInvitationsSent || 0}</div>
      </div>

      <div className="flex pb-2">
        <div className={styles["field-title"]}>Invitations Accepted :</div>
        <div>{selectedBooking?.totalInvitationsAccepted || 0}</div>
      </div>
    </div>
  );
};

export default BookingsPage;
