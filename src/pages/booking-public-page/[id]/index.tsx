import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Empty, message, Spin } from "antd";
import moment from "moment";

import api from "components/axios";
import PublicContainer from "components/PublicContainer";
import { IBooking } from "interfaces/booking.interface";
import styles from "../styles/bookingPublic.module.scss";
import Head from "next/head";

const BookingPublicPage = () => {
  const router = useRouter();
  const bookingId = router.query.id;

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<IBooking>();
  const [errorMsg, setErrorMsg] = useState("");

  const loadDetails = () => {
    setLoading(true);
    api
      .get(`/pht/v1/api/bookings/${bookingId}`)
      .then((r) => {
        if (r.data.status !== "FAILURE") {
          setErrorMsg("");
          setDetails({ ...r.data.data });
        } else {
          if (
            r?.data?.data === `Booking with booking id ${bookingId} not found.`
          ) {
            setErrorMsg(`Booking with booking id ${bookingId} not found.`);
          }
          message.error({
            content: r.data?.data || "Unable to fetch!",
            key: "booking",
            duration: 10,
          });
        }
      })
      .catch((err) => {
        message.error({
          content: err.response?.data?.data || "Unable to fetch!",
          key: "booking",
          duration: 10,
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (bookingId) {
      loadDetails();
    }
  }, [bookingId]);

  return (
    <>
      <Head>
        <title>Healkin</title>
      </Head>

      <PublicContainer title="Booking Details">
        <div className="bg-white border border-gray-300 pt-6 pl-4 pb-4 pr-4">
          {loading ? (
            <Spin />
          ) : errorMsg ? (
            <Empty
              description={errorMsg}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <>
              <h2 className={styles["main-title"]}>Basic Detail</h2>

              <div className={styles["field-item"]}>
                <div className={styles["field-title"]}>Booking ID :</div>
                <div>{bookingId}</div>
              </div>

              <div className={styles["field-item"]}>
                <div className={styles["field-title"]}>Booking Date :</div>
                <div>{details?.createdAtStr || "--"}</div>
              </div>

              <div className={styles["field-item"]}>
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

              <div className={styles["field-item"]}>
                <div className={styles["field-title"]}>Customer Name :</div>
                <div>
                  {details?.customerName || "--"} (
                  {details?.customerEmailId || "--"})
                </div>
              </div>

              <div className={styles["field-item"]}>
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

              <div className={styles["field-item"]}>
                <div className={styles["field-title"]}>Patient Phone :</div>
                <div>{details?.bookingForMember?.phoneNumber || "--"}</div>
              </div>

              <div className={styles["field-item"]}>
                <div className={styles["field-title"]}>Patient Gender :</div>
                <div>{details?.bookingForMember?.gender || "--"}</div>
              </div>

              <div className={styles["field-item"]}>
                <div className={styles["field-title"]}>Patient DOB :</div>
                <div>{details?.bookingForMember?.dob || "--"}</div>
              </div>

              <div className={styles["field-item"]}>
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

              <div className={styles["field-item"]}>
                <div className={styles["field-title"]}>Service Name :</div>
                <div>{details?.serviceName || "--"}</div>
              </div>

              <div className={styles["field-item"]}>
                <div className={styles["field-title"]}>Booking Status :</div>
                <div>{details?.bookingStatusStr || "--"}</div>
              </div>

              <h2 className={`${styles["main-title"]} mt-4`}>Payment Detail</h2>

              <div className={styles["field-item"]}>
                <div className={styles["field-title"]}>Payment Id :</div>
                <div>{details?.payment?.paymentId || "--"}</div>
              </div>

              <div className={styles["field-item"]}>
                <div className={styles["field-title"]}>Transaction Id :</div>
                <div>{details?.payment?.transactionId || "--"}</div>
              </div>

              <div className={styles["field-item"]}>
                <div className={styles["field-title"]}>Status :</div>
                <div>{details?.payment?.paymentStatus || "--"}</div>
              </div>

              <div className={styles["field-item"]}>
                <div className={styles["field-title"]}>Channel :</div>
                <div>{details?.payment?.paymentChannel || "--"}</div>
              </div>

              <div className={styles["field-item"]}>
                <div className={styles["field-title"]}>Amount :</div>
                <div>
                  {details?.payment?.amount || details?.payment?.amount === 0
                    ? `₹ ${details.payment.amount}`
                    : "--"}
                </div>
              </div>
            </>
          )}
        </div>
      </PublicContainer>
    </>
  );
};

export default BookingPublicPage;
