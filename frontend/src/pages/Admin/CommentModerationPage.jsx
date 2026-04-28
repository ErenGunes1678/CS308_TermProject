import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  approveComment,
  getPendingComments,
  rejectComment,
} from "../../services/commentService";

function CommentModerationPage() {
  const { user, isLoading } = useAuth();
  const [comments, setComments] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isLoading || !user) {
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
  }, [isLoading, user]);

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleModeration = async (commentId, action) => {
    try {
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
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 20px 60px" }}>
      <h1 style={{ margin: 0, color: "#0d1b3d" }}>Pending Comments</h1>
      <p style={{ color: "#667085", marginTop: 12 }}>
        Review submitted comments and approve or reject them.
      </p>

      {isPageLoading ? (
        <p>Loading comments...</p>
      ) : errorMessage ? (
        <p>{errorMessage}</p>
      ) : comments.length === 0 ? (
        <p>No pending comments.</p>
      ) : (
        <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
          {comments.map((comment) => (
            <article
              key={comment.id}
              style={{
                border: "1px solid #ececf1",
                borderRadius: 16,
                background: "#fff",
                padding: 20,
              }}
            >
              <p style={{ margin: 0, fontWeight: 700, color: "#0d1b3d" }}>
                Product: {comment.product?.name || "Unknown"} #{comment.product?.id}
              </p>
              <p style={{ margin: "8px 0 0", color: "#667085" }}>
                User: {comment.user?.name || "Unknown"} | Rating: {comment.rating}/5
              </p>
              <p style={{ margin: "12px 0 0", color: "#0d1b3d" }}>
                {comment.comment_text}
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button
                  type="button"
                  onClick={() => handleModeration(comment.id, "approve")}
                  style={{
                    border: "none",
                    borderRadius: 12,
                    background: "#0d1b3d",
                    color: "#fff",
                    padding: "10px 16px",
                    cursor: "pointer",
                  }}
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleModeration(comment.id, "reject")}
                  style={{
                    border: "1px solid #d9e2ef",
                    borderRadius: 12,
                    background: "#fff",
                    color: "#0d1b3d",
                    padding: "10px 16px",
                    cursor: "pointer",
                  }}
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentModerationPage;
