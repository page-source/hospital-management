import { IAddress } from "interfaces/common.interface";


export const getAddressString = (obj?: IAddress) => {
  const finalStringArr = [];
  if (obj?.addressLine1) {
    finalStringArr.push(obj.addressLine1);
  }
  if (obj?.addressLine2) {
    finalStringArr.push(obj.addressLine2);
  }
  if (obj?.city) {
    finalStringArr.push(obj.city);
  }
  if (obj?.state) {
    finalStringArr.push(obj.state);
  }
  if (obj?.pinCode) {
    finalStringArr.push(obj.pinCode);
  }
  if (obj?.country) {
    finalStringArr.push(obj.country);
  }
  return finalStringArr.join(", ");
};

export const generateReadableStr = (str = "") => {
  return str
    ?.split("_")
    .filter((el) => el && typeof el === "string")
    .map((el) => el.charAt(0).toUpperCase() + el.slice(1))
    .join(" ");
};
