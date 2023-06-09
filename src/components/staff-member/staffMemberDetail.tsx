import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button, Empty, Rate, Spin, Switch } from "antd";
import Link from "next/link";
import moment from "moment";

import api from "components/axios";
import { getBase64FromURL } from "commonFunctions/upload-helper";
import { IStaffMember } from "interfaces/staff-member.interface";
import { IRating } from "interfaces/common.interface";

import styles from "./styles/staffMember.module.scss";

const StaffMemberDetail = () => {
  const router = useRouter();
  const staffId = router.query.id;
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<IStaffMember | undefined>();
  const [loadingRatings, setLoadingRating] = useState(false);
  const [ratings, setRatings] = useState<IRating[]>([]);

  const loadDetails = () => {
    setLoading(true);
    api
      .get("/pht/v1/api/staff/action/get-by-id", {
        params: { staff_id: staffId },
      })
      .then((r) => {
        (async function () {
          const obj = r.data?.data || {};
          if (obj.profilePicture) {
            obj.profilePictureBase64 = await getBase64FromURL(
              obj.profilePicture
            );
          }
          if (Object.keys(obj.documents || {}).length) {
            for (let docName in obj.documents) {
              const base64URL = obj.documents[docName]
                ? await getBase64FromURL(obj.documents[docName])
                : "";
              obj.documents[docName] = {
                url: obj.documents[docName],
                base64: base64URL,
              };
            }
          }
          setDetails(obj);
          setLoading(false);
        })();
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const loadRatings = () => {
    setLoadingRating(true);
    api
      .get(`/pht/v1/api/ratings/CAREGIVER/${staffId}`)
      .then((r) => setRatings(r.data?.data || []))
      .catch((err) => console.log(err))
      .finally(() => setLoadingRating(false));
  };

  useEffect(() => {
    if (staffId) {
      loadDetails();
      loadRatings();
    }
  }, [staffId]);

  return (
    <>
      {loading ? (
        <div className="spinner-container">
          <Spin />
        </div>
      ) : (
        <>
          <div className="flex justify-between mb-4">
            <h2 className={styles["main-title"]} style={{ marginBottom: 0 }}>
              Basic Details
            </h2>

            <Link href={`/staff-list/${staffId}?edit=true`}>
              <Button type="primary">Edit Staff-Member</Button>
            </Link>
          </div>

          {details?.profilePictureBase64 && (
            <img
              src={details.profilePictureBase64}
              className={styles["photo"]}
              alt="Profile Photo"
            />
          )}

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Employee Name :</div>
            <div>{details?.employeeName || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Father's Name :</div>
            <div>{details?.fatherName || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Month :</div>
            <div>{details?.month || "--"}</div>
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
            <div className={styles["field-title"]}>Age :</div>
            <div>{details?.age || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Joining Date :</div>
            <div>{details?.joiningDate || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Id :</div>
            <div>{details?.hasID ? "Yes" : "No"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Verification :</div>
            <div>{details?.verification || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Contract :</div>
            <div>{details?.contract || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Staff Type :</div>
            <div>{details?.role || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Department :</div>
            <div>{details?.department || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Cost Centre :</div>
            <div>{details?.costCentre || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Retainer Employee No. :</div>
            <div>{details?.retainerEmpNo || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Retainer Contract No. :</div>
            <div>{details?.retainerContactNumber || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Per Visit Charge :</div>
            <div>
              {details?.perVisitCharges || details?.perVisitCharges === 0
                ? `₹ ${details.perVisitCharges}`
                : "--"}
            </div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Tele-Service Charge :</div>
            <div>
              {details?.teleServiceCharges || details?.teleServiceCharges === 0
                ? `₹ ${details.teleServiceCharges}`
                : "--"}
            </div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>
              Retainership Fees-Standard (12 HRS) :
            </div>
            <div>
              {details?.retainerShipFeeStandard12Hours ||
              details?.retainerShipFeeStandard12Hours === 0
                ? `₹ ${details.retainerShipFeeStandard12Hours}`
                : "--"}
            </div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>
              Retainership Fees-Advanced (24 HRS) :
            </div>
            <div>
              {details?.retainerShipFeeAdvanced24Hours ||
              details?.retainerShipFeeAdvanced24Hours === 0
                ? `₹ ${details.retainerShipFeeAdvanced24Hours}`
                : "--"}
            </div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Available for Duty :</div>
            <div>{details?.availableOnDuty || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Covid Duty - 24 HRS :</div>
            <div>{details?.covidDuty24Hours || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Location :</div>
            <div>{details?.location || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>
              Relevant Experience (in Years) :
            </div>
            <div>
              {details?.relevantExperienceInnYears ||
              details?.relevantExperienceInnYears === 0
                ? `${details.relevantExperienceInnYears} Years`
                : "--"}
            </div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>
              Nursing Council Registration No. :
            </div>
            <div>{details?.nursingCouncilRegistrationNumber || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>NCR Expiry Date :</div>
            <div>{details?.ncrExpiryDate || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Letter Start Date :</div>
            <div>{details?.letterStartDate || ""}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Letter End Date :</div>
            <div>{details?.letterEndDate || ""}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Avg. Rating :</div>
            <div>
              <Rate allowHalf disabled value={details?.avgRating} />
            </div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Total Ratings :</div>
            <div>{details?.totalRatings || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Lead Sending Enabled? :</div>
            <div>
              <Switch checked={details?.isLeadSendingEnabled} disabled />
            </div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Servicable Zipcodes :</div>
            <div>{details?.serviceableZipCodes?.join(", ") || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Email :</div>
            <div>{details?.emailId || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Mobile Number :</div>
            <div>{details?.mobileNumber || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>
              Emergency Contact Number :
            </div>
            <div>{details?.emergencyContactNumber || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Current Address :</div>
            <div>{details?.currentAddress || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Address as on Aadhaar :</div>
            <div>{details?.addressAsOnAadhaar || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Name as per Bank :</div>
            <div>{details?.nameAsPerBank || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>PAN Number :</div>
            <div>{details?.panNo || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Bank Name :</div>
            <div>{details?.bankName || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Bank Account Number :</div>
            <div>{details?.bankAccountNumber || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>IFSC Code :</div>
            <div>{details?.ifscCode || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Aadhaar Number :</div>
            <div>{details?.aadhaarNumber || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Highest Education :</div>
            <div>{details?.highestEducation || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Signatory :</div>
            <div>{details?.signatory || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Remarks :</div>
            <div>{details?.remarks || "--"}</div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Language :</div>
            <div>{details?.language || "--"}</div>
          </div>

          <div className="flex pb-4">
            <div className={styles["field-title"]}>Documents :</div>
            <div className={styles["table-wrapper"]}>
              {Object.keys(details?.documents || {}).length > 0 ? (
                <table>
                  <colgroup>
                    <col style={{ width: "250px" }} />
                    <col style={{ width: "120px" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Document</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(details?.documents || {}).map(
                      (docName: string) => (
                        <tr key={docName}>
                          <td>{docName}</td>
                          <td>
                            <div className={styles["doc-photo-field-div"]}>
                              {details?.documents[docName].base64 ? (
                                <img
                                  src={details.documents[docName].base64}
                                  className={styles["photo-field"]}
                                />
                              ) : (
                                "--"
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              ) : (
                "--"
              )}
            </div>
          </div>

          <div className="flex pb-4">
            <div className={styles["field-title"]}>
              Serviceable Service Types:
            </div>
            <div className={styles["table-wrapper"]}>
              {details?.serviceableServices
                ? details?.serviceableServices.map(
                    (item: unknown, index: number) =>
                      `${item as string}${
                        index < details?.serviceableServices.length - 1
                          ? ","
                          : ""
                      } `
                  )
                : "--"}
            </div>
          </div>

          <div className="flex pb-4">
            <div className={styles["field-title"]}>Bookings List :</div>
            <div className={styles["table-wrapper"]}>
              {Number(details?.bookingInvitationList?.length) > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Service Name</th>
                      <th>Booking Status</th>
                      <th>Booking Creation Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details?.bookingInvitationList.map((el) => (
                      <tr key={el.bookingId}>
                        <td>{el.bookingId}</td>
                        <td>{el.serviceName || "--"}</td>
                        <td>{el.bookingInvitationStatus || "--"}</td>
                        <td>{el.createdAtStr || "--"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                "--"
              )}
            </div>
          </div>

          <div className="flex pb-2">
            <div className={styles["field-title"]}>Ratings List :</div>
            <div className={styles["table-wrapper"]}>
              <table>
                <thead>
                  <tr>
                    <th>Rating Given On</th>
                    <th>Customer Name</th>
                    <th>Customer Email-ID</th>
                    <th>Rating</th>
                    <th>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingRatings ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="spinner-container">
                          <Spin />
                        </div>
                      </td>
                    </tr>
                  ) : ratings?.length > 0 ? (
                    <>
                      {ratings.map((el) => (
                        <tr key={el.ratingId}>
                          <td>
                            {el.createdAt
                              ? moment(el.createdAt).format(
                                  "DD MMM, YYYY hh:mm A"
                                )
                              : "--"}
                          </td>
                          <td>
                            {el.customerName ? (
                              <Link href={`/customers/${el.customerId}`}>
                                {el.customerName}
                              </Link>
                            ) : (
                              "--"
                            )}
                          </td>
                          <td>{el.customerEmailId || "--"}</td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            <Rate allowHalf disabled value={el.ratingValue} />
                          </td>
                          <td>{el.ratingComment || "--"}</td>
                        </tr>
                      ))}
                    </>
                  ) : (
                    <tr>
                      <td colSpan={5}>
                        <Empty description="No ratings found!" />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default StaffMemberDetail;
