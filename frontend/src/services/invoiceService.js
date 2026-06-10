import api from "./api";

export const getInvoices = async ({ from, to, q } = {}) => {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  if (q) params.q = q;

  const { data } = await api.get("/invoices", { params });
  return data;
};

export const downloadInvoicePdf = async (invoiceId, fileName) => {
  const response = await api.get(`/invoices/${invoiceId}/download`, {
    responseType: "blob",
  });

  const url = URL.createObjectURL(response.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
