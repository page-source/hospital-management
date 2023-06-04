import { useEffect, useRef, useState } from "react";
import { Dropdown, Table } from "antd";
import Image from "next/image";
import { useRouter } from "next/router";
import { ColumnsType } from "antd/lib/table";
import moment from "moment";

import { ICustomer } from "interfaces/customer.interface";
import { IPagination } from "interfaces/common.interface";
import api from "components/axios";
import Container from "components/Container";
import MenuIcon from "assets/menu.svg";
import { getAddressString } from "utils/functions";

const CustomerssPage = () => {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [bookingsList, setBookingsList] = useState<ICustomer[]>([]);
  const [pagination, setPagination] = useState<IPagination>({
    current: 0,
    pageSize: 25,
    total: 0,
  });

  const getBookings = () => {
    setLoading(true);
    api
      .get(`/pht/v1/api/customers`, {
        params: {
          limit: pagination.pageSize,
          page: pagination.current,
        },
      })
      .then((r) => {
        const arr = r.data?.data?.customers || [];
        setBookingsList(arr);
        setPagination((prev) => ({
          ...prev,
          total: r.data?.data?.totalItems || 0,
        }));
      })
      .catch(console.log)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getBookings();
  }, [pagination.current, pagination.pageSize]);

  const columns: ColumnsType<ICustomer> = [
    {
      title: "Name",
      dataIndex: "firstName",
      width: 150,
      render: (val, record) =>
        `${record.firstName || "--"} ${record.lastName || ""}`,
    },
    {
      title: "Email",
      dataIndex: "emailId",
      width: 200,
      render: (val) => val || "--",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      width: 140,
      render: (val) => val || "--",
    },
    {
      title: "Address",
      dataIndex: "customerAddress",
      width: 200,
      render: (val) => (val ? getAddressString(val) : "--"),
    },
    {
      title: "Date of Birth",
      dataIndex: "dob",
      width: 120,
      render: (val) => val || "--",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      width: 90,
      render: (val) => val || "--",
    },
    {
      title: "Family Members",
      dataIndex: "familyMembers",
      width: 150,
      render: (val) => (val?.length || val?.length === 0 ? val.length : "--"),
    },
    {
      title: "Signed Up On",
      dataIndex: "createdAt",
      width: 200,
      render: (val, record) =>
        record.createdAtStr || val
          ? moment(new Date(val)).format("DD MMM, YYYY hh:mm A")
          : "--",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      width: 80,
      fixed: "right",
      render: (val: any, record: ICustomer) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "view-details",
                label: <div id="options-view-details">View Details</div>,
                onClick: () =>
                  router.push(`${router.pathname}/${record.customerId}`),
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

  return (
    <Container>
      <div ref={wrapperRef} className="bg-white border border-gray-300">
        <Table
          rowKey={(row) => row.customerId}
          columns={columns}
          dataSource={bookingsList}
          loading={loading}
          scroll={{
            x: wrapperRef.current?.clientWidth,
            y: `calc(100vh - 210px)`,
          }}
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
    </Container>
  );
};

export default CustomerssPage;
