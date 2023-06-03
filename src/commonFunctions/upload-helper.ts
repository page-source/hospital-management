import api from "components/axios";

export const getBase64FromURL = async (fileURL: string) => {
  const ext = fileURL.substring(fileURL.lastIndexOf(".") + 1);
  const resp: any = await api
    .get("/pht/v1/api/file/action/download", { params: { file_path: fileURL } })
    .then((response) => response)
    .catch(console.log);

  return resp?.data?.data ? `${getBase64Prefix(ext)}${resp.data.data}` : "";
};

const getBase64Prefix = (extension: string) => {
  switch (extension) {
    case "jpeg":
    case "jpg":
    case "png":
      return `data:image/${extension};base64,`;
    case "pdf":
      return `data:application/pdf;base64,`;
    default:
      break;
  }
};
