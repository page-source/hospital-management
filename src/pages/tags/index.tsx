import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Table, message, Dropdown, Spin, Button } from "antd";
import { ColumnsType } from "antd/lib/table";

import api from "components/axios";
import Container from "components/Container";
import MenuIcon from "assets/menu.svg";
import { ITag } from "interfaces/tag-interface";

const TagsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tagsList, setTagsData] = useState<ITag[]>([]);
  const [deletingList, setDeletingList] = useState<string[]>([]);

  const fetchList = () => {
    setLoading(true);
    api
      .get("/pht/v1/api/tags")
      .then((r) => setTagsData(r.data?.data || []))
      .catch(console.log)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, []);

  const deleteTag = (tagId: string) => {
    setDeletingList((prev) => [...prev, tagId]);
    api
      .delete(`/pht/v1/api/tags/${tagId}`)
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

  const columns: ColumnsType<ITag> = [
    {
      title: "Name",
      dataIndex: "tagName",
      render: (val: string) => val || "--",
    },
    {
      title: "Description",
      dataIndex: "tagShortDescription",
      render: (val: string) => val || "--",
    },
    {
      title: "Services",
      dataIndex: "serviceNames",
      render: (val: []) =>
        val?.map((el: any) => el.name).join(", ") || "--",
    },
    {
      title: "Last Updated At",
      dataIndex: "updatedAtStr",
      render: (val: string) => val || "--",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (val: any, record: any) => (
        <Dropdown
          menu={{
            items: [
              {
                label: "Edit Details",
                key: "edit",
                onClick: () =>
                  router.push(`${router.pathname}/${record.tagId}`),
              },
              {
                label: (
                  <div>
                    {deletingList.includes(record.tagId) && (
                      <Spin size="small" style={{ marginRight: "10px" }} />
                    )}
                    <span>Delete</span>
                  </div>
                ),
                key: "delete",
                disabled: deletingList.includes(record.tagId),
                onClick: () => deleteTag(record.tagId),
              },
            ],
          }}
        >
          <Image src={MenuIcon} style={{ cursor: "pointer" }} />
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
          marginBottom: 20,
        }}
      >
        <Button
          type="primary"
          onClick={() => router.push(`${router.pathname}/new`)}
        >
          Add Package
        </Button>
      </div>
      <div className="bg-white border border-gray-300">
        <Table
          columns={columns}
          dataSource={tagsList}
          loading={loading}
          pagination={false}
          rowKey={(row) => row.tagId}
        />
      </div>
    </Container>
  );
};

export default TagsPage;
