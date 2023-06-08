import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { message, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import moment from "moment";

import api from "components/axios";
import { ICustomer } from "interfaces/customer.interface";
import { getAddressString } from "utils/functions";

import styles from "./styles/customerDetail.module.scss";

const CustomerDetails = () => {
  const router = useRouter();
  const customerId = router.query.id;

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<ICustomer>();

  const loadDetails = () => {
    api
      .get(`/pht/v1/api/customers/${customerId}`)
      .then((r) => {
        if (r.data.status !== "FAILURE") {
          setDetails({ ...r.data.data });
        } else {
          message.error({
            content: r.data?.data || "Unable to fetch!",
            key: "customer",
            duration: 4,
          });
        }
      })
      .catch(console.log)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (customerId) {
      loadDetails();
    }
  }, [customerId]);

  return (
    <>
      <div className="flex justify-between mb-4">
        <Link href="/customers">
          <a className="flex items-center gap-2">
            <ArrowLeftOutlined />
            <i className="font-medium">Back to Customers List</i>
          </a>
        </Link>
      </div>

      <h2 className={styles["main-title"]}>Customer Detail</h2>

      {loading ? (
        <div className="text-center">
          <Spin />
        </div>
      ) : (
        <>
          <div className="flex pb-2">
            <div className={styles["field-title"]}>Name :</div>
            <div>
              {details?.firstName || "--"} {details?.lastName || ""}
            </div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Email :</div>
            <div>{details?.emailId || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Phone Number :</div>
            <div>{details?.phoneNumber || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Status :</div>
            <div>{details?.status || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Date of Birth :</div>
            <div>{details?.dob || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Gender :</div>
            <div>{details?.gender || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Address :</div>
            <div>
              {details?.customerAddress
                ? getAddressString(details.customerAddress)
                : "--"}
            </div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Status :</div>
            <div>{details?.status || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Signed Up On :</div>
            <div>
              {details?.createdAtStr || details?.createdAt
                ? moment(new Date(details.createdAt)).format(
                    "DD MMM, YYYY hh:mm A"
                  )
                : "--"}
            </div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>FieldEZ CustomerId :</div>
            <div>{details?.fieldEZCustomerId || "--"}</div>
          </div>

          <div
            className={`flex ${
              details?.familyMembers?.length ? "pb-4" : "pb-2"
            }`}
          >
            <div className={styles["field-title"]}>Family Members :</div>
            <div className={styles["table-wrapper"]}>
              {details?.familyMembers?.length ? (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Relation</th>
                      <th>Phone Number</th>
                      <th>Date of Birth</th>
                      <th>Gender</th>
                      <th>Address</th>
                      <th>FieldEZ Customer Id</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.familyMembers.map((el) => (
                      <tr key={el.memberId}>
                        <td>
                          {el.firstName || "--"} {el.lastName || ""}
                        </td>
                        <td>{el.relation || "--"}</td>
                        <td>{el.phoneNumber || "--"}</td>
                        <td>{el.dob || "--"}</td>
                        <td>{el.gender || "--"}</td>
                        <td>{getAddressString({ ...el, addressId: "" })}</td>
                        <td>{el.fieldEZCustomerId || "--"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                "--"
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CustomerDetails;
