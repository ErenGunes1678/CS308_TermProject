import api from "./api";

export const getProducts = async (params = {}) => {
  const { includeUnpriced = false, ...queryParams } = params;
  const path = includeUnpriced ? "/product/manage/all" : "/product";
  const { data } = await api.get(path, { params: queryParams });
  const products = Array.isArray(data) ? data : data.products || [];

  return includeUnpriced
    ? products
    : products.filter((product) => Number(product.price) > 0);
};

export const getManageProducts = async () => {
  const { data } = await api.get("/product/manage/all");
  return Array.isArray(data) ? data : data.products || [];
};

export const getPendingPricingProducts = async () => {
  const { data } = await api.get("/product/pricing/pending");
  return Array.isArray(data) ? data : data.products || [];
};

export const getProductById = async (id) => {
  const { data } = await api.get(`/product/${id}`);
  const product = data.product || data;

  if (Number(product.price) <= 0) {
    throw new Error("Product is waiting for pricing.");
  }

  return product;
};

export const createProduct = async (payload) => {
  const { data } = await api.post("/product", payload);
  return data.product || data;
};

export const updateProduct = async (id, payload) => {
  const { data } = await api.put(`/product/${id}`, payload);
  return data.product || data;
};

export const updateProductPrice = async (id, payload) => {
  const { data } = await api.put(`/product/${id}/price`, payload);
  return data.product || data;
};

export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/product/${id}`);
  return data;
};
