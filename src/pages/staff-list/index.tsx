import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Table, Dropdown, Button, Popconfirm, message, Rate } from "antd";
import { ColumnsType } from "antd/lib/table";
import { QuestionCircleOutlined } from "@ant-design/icons";
import Link from "next/link";

import api from "components/axios";
import Container from "components/Container";
import { IStaffMember } from "interfaces/staff-member.interface";
import { IPagination } from "interfaces/common.interface";
import MenuIcon from "assets/menu.svg";

const StaffMemberList = () => {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<IStaffMember[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState("");
  const [deletingStaffId, setDeletingStaffId] = useState("");
  const [pagination, setPagination] = useState<IPagination>({
    current: 0,
    pageSize: 25,
    total: 0,
  });

  const fetchList = () => {
    setLoading(true);
    api
      .get("/pht/v1/api/staff")
      .then((r) => setStaffList(r.data?.data?.staffList || []))
      .catch(console.log)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, [pagination.current, pagination.pageSize]);

  const deleteStaffMember = (staffId: string) => {
    setDeletingStaffId(staffId);
    api
      .delete(`/pht/v1/api/staff?staff_id=${staffId}`)
      .then((r) => {
        if (r.data?.status !== "FAILURE") {
          setConfirmDeleteId("");
          fetchList();
          message.success({
            content: r.data.data || "Deleted successfully!",
            key: "tags",
            duration: 4,
          });
        } else {
          message.error({
            content: r.data.data || "Unable to delete!",
            key: "tags",
            duration: 4,
          });
        }
      })
      .catch(console.log)
      .finally(() => setDeletingStaffId(""));
  };

  const columns: ColumnsType<IStaffMember> = [
    {
      title: "Staff ID",
      dataIndex: "staffId",
      width: 150,
      fixed: "left",
      render: (val) =>
        val ? (
          <Link href={`/staff-list/${val}`}>
            <a
              href={`/staff-list/${val}`}
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "block",
              }}
            >
              {val}
            </a>
          </Link>
        ) : (
          "--"
        ),
    },
    {
      title: "Name",
      dataIndex: "employeeName",
      width: 150,
      render: (val) => val || "--",
    },
    {
      title: "Email",
      width: 175,
      dataIndex: "emailId",
      render: (val: string) => val || "--",
    },
    {
      title: "Phone Number",
      dataIndex: "mobileNumber",
      width: 140,
      render: (val: string) => val || "--",
    },
    {
      title: "Role",
      dataIndex: "role",
      width: 100,
      render: (val: string) => val || "--",
    },
    {
      title: "DOB",
      dataIndex: "dob",
      width: 120,
      render: (val: string) => val || "--",
    },
    {
      title: "Avg. Rating",
      dataIndex: "avgRating",
      width: 170,
      render: (val, record) => (
        <>
          <Rate allowHalf disabled value={val || 0} />
          <div>
            Total Ratings:{" "}
            {record.totalRatings || record.totalRatings === 0
              ? record.totalRatings
              : "--"}
          </div>
        </>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      fixed: "right",
      width: 100,
      render: (val, record) => (
        <Dropdown
          menu={{
            items: [
              {
                label: "Edit Details",
                key: "edit-details",
                onClick: () =>
                  router.push(`${router.pathname}/${record.staffId}?edit=true`),
              },
              {
                label: "View Details",
                key: "view-details",
                onClick: () =>
                  router.push(`${router.pathname}/${record.staffId}`),
              },
              {
                label: (
                  <Popconfirm
                    title={`Are you sure to delete "${record.employeeName}" ?`}
                    icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                    onConfirm={() => deleteStaffMember(record.staffId)}
                    okButtonProps={{
                      loading: deletingStaffId === record.staffId,
                    }}
                    onCancel={(e) => {
                      e?.stopPropagation();
                      setConfirmDeleteId("");
                    }}
                    cancelButtonProps={{
                      disabled: deletingStaffId === record.staffId,
                    }}
                    open={record.staffId === confirmDeleteId}
                    onOpenChange={() => setConfirmDeleteId("")}
                  >
                    Delete
                  </Popconfirm>
                ),
                key: "delete",
                onClick: () => setConfirmDeleteId(record.staffId),
              },
            ],
          }}
        >
          <Image src={MenuIcon} style={{ cursor: "pointer" }} layout="fixed" />
        </Dropdown>
      ),
    },
  ];

  return (
    <Container>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 10,
        }}
      >
        <Button
          type="primary"
          onClick={() => router.push(`${router.pathname}/new`)}
        >
          Add New Staff Member
        </Button>
      </div>
      <div className="bg-white border border-gray-300" ref={wrapperRef}>
        <Table
          columns={columns}
          dataSource={staffList}
          loading={loading}
          rowKey={(row) => row.staffId}
          scroll={{
            x: wrapperRef.current?.clientWidth,
            y: `calc(100vh - 252px)`,
          }}
          pagination={{
            current: pagination.current + 1,
            pageSize: pagination.pageSize,
            total: pagination.total,
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
    </Container>
  );
};

export default StaffMemberList;
