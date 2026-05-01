import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  approveComment,
  getPendingComments,
  rejectComment,
} from "../../services/commentService";
import "./CommentModerationPage.css";

const formatDate = (value) => {
  if (!value) {
    return "Unknown date";
  }

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

function CommentModerationPage() {
  const { user, isLoading } = useAuth();
  const [comments, setComments] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeCommentId, setActiveCommentId] = useState(null);

  const canModerateComments = user?.role === "product_manager";

  useEffect(() => {
    if (isLoading || !user || !canModerateComments) {
      setIsPageLoading(false);
      return;
    }

    let isMounted = true;

    const loadPendingComments = async () => {
      try {
        setIsPageLoading(true);
        setErrorMessage("");
        const data = await getPendingComments();

        if (isMounted) {
          setComments(Array.isArray(data?.comments) ? data.comments : []);
        }
      } catch (error) {
        if (isMounted) {
          setComments([]);
          setErrorMessage(
            error?.response?.data?.message || "Pending comments could not be loaded."
          );
        }
      } finally {
        if (isMounted) {
          setIsPageLoading(false);
        }
      }
    };

    loadPendingComments();

    return () => {
      isMounted = false;
    };
  }, [canModerateComments, isLoading, user]);

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!canModerateComments) {
    return <Navigate to="/profile" replace />;
  }

  const handleModeration = async (commentId, action) => {
    try {
      setActiveCommentId(commentId);
      setErrorMessage("");

      if (action === "approve") {
        await approveComment(commentId);
      } else {
        await rejectComment(commentId);
      }

      setComments((currentComments) =>
        currentComments.filter((comment) => comment.id !== commentId)
      );
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || "Unable to update comment status."
      );
    } finally {
      setActiveCommentId(null);
    }
  };

  return (
    <div className="comment-moderation-page">
      <section className="comment-moderation-hero">
        <div className="comment-moderation-hero__overlay" />
        <div className="container comment-moderation-hero__content">
          <p className="comment-moderation-hero__eyebrow">Product Manager Console</p>
          <h1 className="comment-moderation-hero__title">Comment Moderation</h1>
          <p className="comment-moderation-hero__tagline">
            Review and manage pending comments.
          </p>
        </div>
      </section>

      <div className="container">
        <section className="comment-moderation-panel">
          <div className="comment-moderation-panel__header">
            <div>
              <p className="comment-moderation-panel__label">Pending Reviews</p>
              <h2 className="comment-moderation-panel__title">
                {isPageLoading ? "Loading queue" : `${comments.length} awaiting review`}
              </h2>
            </div>
            <div className="comment-moderation-panel__badge">
              {comments.length} open
            </div>
          </div>

          {errorMessage ? (
            <div className="comment-moderation-state comment-moderation-state--error">
              <p>{errorMessage}</p>
            </div>
          ) : null}

          {isPageLoading ? (
            <div className="comment-moderation-list">
              {Array.from({ length: 3 }).map((_, index) => (
                <article
                  key={index}
                  className="comment-card comment-card--skeleton"
                  aria-hidden="true"
                >
                  <div className="comment-card__skeleton comment-card__skeleton--title" />
                  <div className="comment-card__skeleton comment-card__skeleton--meta" />
                  <div className="comment-card__skeleton comment-card__skeleton--body" />
                  <div className="comment-card__skeleton comment-card__skeleton--body short" />
                </article>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="comment-moderation-state">
              <h3>All clear</h3>
              <p>No pending comments are waiting for moderation right now.</p>
            </div>
          ) : (
            <div className="comment-moderation-list">
              {comments.map((comment) => {
                const isSubmitting = activeCommentId === comment.id;

                return (
                  <article key={comment.id} className="comment-card">
                    <div className="comment-card__topline">
                      <span className="comment-card__product-tag">
                        {comment.product?.name || "Unknown product"}
                      </span>
                      <span className="comment-card__date">
                        Submitted {formatDate(comment.createdAt)}
                      </span>
                    </div>

                    <div className="comment-card__header">
                      <div>
                        <h3 className="comment-card__title">
                          {comment.product?.model || `Product #${comment.product?.id || "N/A"}`}
                        </h3>
                        <p className="comment-card__meta">
                          By {comment.user?.name || "Unknown user"}
                          {comment.user?.email ? ` • ${comment.user.email}` : ""}
                        </p>
                      </div>
                      <div className="comment-card__rating" aria-label={`Rating ${comment.rating} out of 5`}>
                        <span className="comment-card__rating-value">{comment.rating}</span>
                        <span className="comment-card__rating-scale">/ 5</span>
                      </div>
                    </div>

                    <p className="comment-card__body">{comment.comment_text}</p>

                    <div className="comment-card__actions">
                      <button
                        type="button"
                        className="comment-card__button comment-card__button--approve"
                        onClick={() => handleModeration(comment.id, "approve")}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Saving..." : "Approve"}
                      </button>
                      <button
                        type="button"
                        className="comment-card__button comment-card__button--reject"
                        onClick={() => handleModeration(comment.id, "reject")}
                        disabled={isSubmitting}
                      >
                        Reject
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default CommentModerationPage;
