import { useEffect, useRef, useState } from "react";
import { Table } from "antd";
import { ColumnsType } from "antd/lib/table";

import api from "components/axios";
import Container from "components/Container";
import { IPayment } from "interfaces/payment.interface";

const PaymentsPage = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [paymentsList, setPaymentsList] = useState<IPayment[]>([]);
  const [pagination, setPagination] = useState({
    current: 0,
    pageSize: 25,
    total: 0,
  });

  const getPayments = () => {
    setLoading(true);
    api
      .get(
        `/pht/v1/api/bookings/action/list-payments?limit=${pagination.pageSize}&page=${pagination.current}`
      )
      .then((r) => {
        setPaymentsList(r.data?.data?.payments || []);
        setPagination((prev) => ({
          ...prev,
          total: r.data?.data?.totalItems || 0,
        }));
      })
      .catch(console.log)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getPayments();
  }, [pagination.current, pagination.pageSize]);

  const columns: ColumnsType<IPayment> = [
    {
      title: "Customer Name",
      dataIndex: "customerName",
      width: 200,
      render: (val: string, record: IPayment) =>
        val ? <>{`${val} (${record.customerEmailId || `--`})`}</> : "--",
    },
    {
      title: "Razorpay ID",
      dataIndex: "transactionId",
      width: 175,
      render: (val: string) => val || "--",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      width: 90,
      render: (val: number) => (val || val === 0 ? `₹ ${val}` : "--"),
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      width: 150,
      render: (val: string) => val || "--",
    },
    {
      title: "Booking ID",
      dataIndex: "bookingId",
      width: 150,
      render: (val: string) => val || "--",
    },
    {
      title: "FieldEZ ID",
      dataIndex: "fieldEZTicketID",
      width: 100,
      render: (val: string) => val || "--",
    },
    {
      title: "Payment ID",
      dataIndex: "paymentId",
      width: 220,
      render: (val: string) => val || "--",
    },
    {
      title: "Last updated at",
      dataIndex: "updatedAtStr",
      width: 200,
      render: (val: string) => val || "--",
    },
  ];

  return (
    <Container>
      <div className="bg-white border border-gray-300" ref={wrapperRef}>
        <Table
          rowKey={(row) => row.transactionId}
          columns={columns}
          dataSource={paymentsList}
          loading={loading}
          scroll={{
            x: wrapperRef.current?.clientWidth,
            y: `calc(100vh - 210px)`,
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

export default PaymentsPage;
