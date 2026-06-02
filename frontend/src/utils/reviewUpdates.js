export const PRODUCT_REVIEW_UPDATED_EVENT = "product-review-updated";

export const emitProductReviewUpdated = (productId) => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(PRODUCT_REVIEW_UPDATED_EVENT, {
      detail: { productId: Number(productId) },
    })
  );
};

