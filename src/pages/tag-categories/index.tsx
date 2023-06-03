import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Table, message, Dropdown, Spin, Button } from "antd";
import { ColumnsType } from "antd/lib/table";

import api from "components/axios";
import Container from "components/Container";
import MenuIcon from "assets/menu.svg";
import { ITag } from "interfaces/tag-interface";
import { ITagsCategory } from "interfaces/tags-category-interface";

const TagCategoriesPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deletingTagList, setDeletingTagList] = useState<string[]>([]);
  const [tagsCategoriesList, setTagsCategoriesData] = useState<ITagsCategory[]>(
    []
  );

  const fetchList = () => {
    setLoading(true);
    api
      .get("/pht/v1/api/tags-category")
      .then((r) => setTagsCategoriesData(r.data?.data || []))
      .catch(console.log)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
  }, []);

  const deleteTag = (tagCategoryId: string) => {
    setDeletingTagList((prev) => [...prev, tagCategoryId]);
    api
      .delete(`/pht/v1/api/tags-category/${tagCategoryId}`)
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

  const columns: ColumnsType<ITagsCategory> = [
    {
      title: "Name",
      dataIndex: "tagCategoryName",
      render: (val: string) => val || "--",
    },
    {
      title: "Description",
      dataIndex: "tagCategoryShortDescription",
      render: (val: string) => val || "--",
    },
    {
      title: "Packages",
      dataIndex: "tagList",
      render: (val: ITag[]) => val?.map((el) => el.tagName).join(", ") || "--",
    },
    {
      title: "Last Updated At",
      dataIndex: "updatedAtStr",
      render: (val: string) => val || "--",
    },
    {
      title: "",
      dataIndex: "actions",
      render: (val: any, record: ITagsCategory) => (
        <Dropdown
          menu={{
            items: [
              {
                label: "Edit Details",
                key: "edit",
                onClick: () =>
                  router.push(`${router.pathname}/${record.tagCategoryId}`),
              },
              {
                label: (
                  <div>
                    {deletingTagList.includes(record.tagCategoryId) && (
                      <Spin size="small" style={{ marginRight: "10px" }} />
                    )}
                    <span>Delete</span>
                  </div>
                ),
                key: "delete",
                disabled: deletingTagList.includes(record.tagCategoryId),
                onClick: () => deleteTag(record.tagCategoryId),
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
          Add Package Category
        </Button>
      </div>
      <div className="bg-white border border-gray-300">
        <Table
          columns={columns}
          dataSource={tagsCategoriesList}
          loading={loading}
          pagination={false}
          rowKey={(row) => row.tagCategoryId}
        />
      </div>
    </Container>
  );
};

export default TagCategoriesPage;
