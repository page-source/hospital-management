import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Table, Dropdown, message, Spin } from "antd";
import { ColumnsType } from "antd/lib/table";

import api from "components/axios";
import Container from "components/Container";
import MenuIcon from "assets/menu.svg";
import { IService } from "interfaces/service.interface";
import { IPagination } from "interfaces/common.interface";

const ServicesPage = () => {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [servicesList, setServicesData] = useState<IService[]>([]);
  const [deletingList, setDeletingList] = useState<string[]>([]);
  const [pagination, setPagination] = useState<IPagination>({
    current: 0,
    pageSize: 25,
    total: 0,
  });

  const fetchList = () => {
    setLoading(true);
    api
      .get("/pht/v1/api/service")
      .then((r) => setServicesData(r.data?.data?.services || []))
      .catch(console.log)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, [pagination.current, pagination.pageSize]);

  const deleteService = (tagId: string) => {
    setDeletingList((prev) => [...prev, tagId]);
    api
      .delete(`/pht/v1/api/service/${tagId}`)
      .then((r) => {
        if (r.data?.status !== "FAILURE") {
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
      .finally(() => setLoading(false));
  };

  const columns: ColumnsType<IService> = [
    {
      title: "Name",
      dataIndex: "name",
      width: 150,
      render: (val: string) => val || "--",
    },
    {
      title: "Short Description",
      dataIndex: "shortDescription",
      width: 250,
      render: (val: string) => val || "--",
    },
    {
      title: "Price",
      dataIndex: "regularPrice",
      width: 100,
      render: (val: number) => (val || val === 0 ? `₹ ${val}` : "--"),
    },
    {
      title: "Category",
      dataIndex: "categoryName",
      width: 150,
      render: (val: string) => val || "--",
    },
    {
      title: "Sub Category",
      dataIndex: "subCategoryName",
      width: 150,
      render: (val: string) => val || "--",
    },
    {
      title: "Location",
      dataIndex: "locations",
      width: 200,
      render: (val: string[]) => val?.join(", ") || "--",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      fixed: "right",
      width: 90,
      render: (val: any, record: IService) => (
        <Dropdown
          menu={{
            items: [
              {
                label: "Edit Details",
                key: "edit_details",
                onClick: () =>
                  router.push(`${router.pathname}/${record.serviceId}`),
              },
              {
                label: (
                  <div>
                    {deletingList.includes(record.serviceId) && (
                      <Spin size="small" style={{ marginRight: "10px" }} />
                    )}
                    <span>Delete</span>
                  </div>
                ),
                key: "delete",
                disabled: deletingList.includes(record.serviceId),
                onClick: () => deleteService(record.serviceId),
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
      <div ref={wrapperRef} className="bg-white border border-gray-300">
        <Table
          columns={columns}
          dataSource={servicesList}
          loading={loading}
          rowKey={(row) => row.serviceId}
          scroll={{
            x: wrapperRef.current?.clientWidth,
            y: `calc(100vh - 210px)`,
          }}
          pagination={{
            current: pagination.current + 1,
            pageSize: pagination.pageSize,
            showSizeChanger: true,
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

export default ServicesPage;
