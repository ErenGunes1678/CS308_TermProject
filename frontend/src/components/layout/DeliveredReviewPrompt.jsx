import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { createComment } from "../../services/commentService";
import { getOrders } from "../../services/orderService";
import { emitProductReviewUpdated } from "../../utils/reviewUpdates";
import "./DeliveredReviewPrompt.css";

const buildStorageKey = (userId) => `review-prompt-hidden:${userId}`;

const readHiddenProductIds = (userId) => {
  if (!userId || typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(buildStorageKey(userId));
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeHiddenProductIds = (userId, productIds) => {
  if (!userId || typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(buildStorageKey(userId), JSON.stringify(productIds));
};

const getDeliveredReviewCandidates = (orders) => {
  if (!Array.isArray(orders)) {
    return [];
  }

  const seenProductIds = new Set();
  const candidates = [];

  orders
    .filter((order) => order?.status === "delivered")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .forEach((order) => {
      (order.items || []).forEach((item) => {
        const productId = Number(item?.product_id);

        if (!productId || seenProductIds.has(productId) || !item?.product?.name) {
          return;
        }

        seenProductIds.add(productId);
        candidates.push({
          orderId: order.id,
          deliveredAt: order.createdAt,
          productId,
          productName: item.product.name,
          productImage: item.product.image || "",
          productBrand: item.product.brand || "",
        });
      });
    });

  return candidates;
};

const ReviewStars = ({ value, onChange }) => (
  <div className="review-prompt__stars" role="radiogroup" aria-label="Product rating">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className="review-prompt__star-btn"
        onClick={() => onChange(star)}
        aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
        aria-pressed={value === star}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill={star <= value ? "var(--color-star)" : "none"}
          stroke={star <= value ? "var(--color-star)" : "var(--color-gray-300)"}
          strokeWidth="1.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </button>
    ))}
  </div>
);

const DeliveredReviewPrompt = () => {
  const { user, isLoading } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [activePrompt, setActivePrompt] = useState(null);
  const [rating, setRating] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCustomer = user?.role === "customer";

  useEffect(() => {
    if (isLoading || !isCustomer) {
      return;
    }

    let isMounted = true;

    const loadDeliveredOrders = async () => {
      try {
        const data = await getOrders();

        if (!isMounted) {
          return;
        }

        const hiddenProductIds = new Set(readHiddenProductIds(user.id).map(Number));
        const deliveredProducts = getDeliveredReviewCandidates(data?.orders).filter(
          (candidate) => !hiddenProductIds.has(candidate.productId)
        );

        setCandidates(deliveredProducts);
        setActivePrompt(deliveredProducts[0] || null);
      } catch {
        if (isMounted) {
          setCandidates([]);
          setActivePrompt(null);
        }
      }
    };

    loadDeliveredOrders();

    return () => {
      isMounted = false;
    };
  }, [isCustomer, isLoading, user?.id]);

  useEffect(() => {
    setRating(0);
    setCommentText("");
    setSubmitError("");
    setSubmitSuccess("");
  }, [activePrompt?.productId]);

  useEffect(() => {
    if (!activePrompt) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        handleDismiss();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [activePrompt]);

  const remainingCount = useMemo(
    () => Math.max(0, candidates.length - 1),
    [candidates.length]
  );

  const hidePromptForProduct = (productId) => {
    const hiddenProductIds = Array.from(
      new Set([...readHiddenProductIds(user?.id), Number(productId)])
    );

    writeHiddenProductIds(user?.id, hiddenProductIds);

    setCandidates((currentCandidates) => {
      const nextCandidates = currentCandidates.filter(
        (candidate) => candidate.productId !== Number(productId)
      );
      setActivePrompt(nextCandidates[0] || null);
      return nextCandidates;
    });
  };

  const handleDismiss = () => {
    if (!activePrompt) {
      return;
    }

    hidePromptForProduct(activePrompt.productId);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!activePrompt || rating === 0 || commentText.trim() === "") {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      await createComment(activePrompt.productId, {
        rating,
        comment_text: commentText.trim(),
      });

      emitProductReviewUpdated(activePrompt.productId);
      setSubmitSuccess("Your review was sent. The rating is recorded now and the comment is pending approval.");

      window.setTimeout(() => {
        hidePromptForProduct(activePrompt.productId);
      }, 900);
    } catch (error) {
      setSubmitError(
        error?.response?.data?.message || "Unable to submit your review right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !isCustomer || !activePrompt) {
    return null;
  }

  return (
    <div className="review-prompt__overlay" onClick={handleDismiss}>
      <section
        className="review-prompt"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-prompt-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="review-prompt__close"
          onClick={handleDismiss}
          aria-label="Close review prompt"
        >
          ×
        </button>

        <div className="review-prompt__eyebrow">Delivered Order</div>
        <h2 id="review-prompt-title" className="review-prompt__title">
          Review {activePrompt.productName}
        </h2>
        <p className="review-prompt__text">
          Your order was delivered. Rate the product now and leave a comment for moderation.
        </p>

        <div className="review-prompt__product">
          <div className="review-prompt__thumb">
            {activePrompt.productImage ? (
              <img src={activePrompt.productImage} alt={activePrompt.productName} />
            ) : (
              <span>{activePrompt.productName.charAt(0)}</span>
            )}
          </div>
          <div className="review-prompt__product-copy">
            <span className="review-prompt__brand">{activePrompt.productBrand || "Product"}</span>
            <Link to={`/product/${activePrompt.productId}`} className="review-prompt__name">
              {activePrompt.productName}
            </Link>
            <span className="review-prompt__meta">From order #{activePrompt.orderId}</span>
          </div>
        </div>

        <form className="review-prompt__form" onSubmit={handleSubmit}>
          <label className="review-prompt__label">
            Your Rating
            <ReviewStars value={rating} onChange={setRating} />
          </label>

          <label className="review-prompt__label">
            Your Comment
            <textarea
              className="review-prompt__textarea"
              rows={4}
              placeholder="Tell other customers how the product felt, wore, or performed."
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
            />
          </label>

          {submitError ? (
            <div className="site-inline-message site-inline-message--error" role="alert">
              {submitError}
            </div>
          ) : null}

          {submitSuccess ? (
            <div className="review-prompt__success" role="status">
              {submitSuccess}
            </div>
          ) : null}

          <div className="review-prompt__actions">
            <button
              type="button"
              className="review-prompt__secondary"
              onClick={handleDismiss}
              disabled={isSubmitting}
            >
              Maybe later
            </button>
            <button
              type="submit"
              className="review-prompt__primary"
              disabled={isSubmitting || rating === 0 || commentText.trim() === ""}
            >
              {isSubmitting ? "Sending..." : "Submit review"}
            </button>
          </div>
        </form>

        {remainingCount > 0 ? (
          <p className="review-prompt__remaining">
            {remainingCount} more delivered product{remainingCount === 1 ? "" : "s"} can be reviewed later.
          </p>
        ) : null}
      </section>
    </div>
  );
};

export default DeliveredReviewPrompt;
