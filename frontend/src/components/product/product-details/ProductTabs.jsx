import StarRating from './StarRating';

function ClickableStars({ reviewRating, onRatingChange }) {
  return [1, 2, 3, 4, 5].map((star) => (
    <button
      key={star}
      type="button"
      className="pdp-review-form__star-btn"
      onClick={() => onRatingChange(star)}
    >
      <svg width="24" height="24" viewBox="0 0 24 24"
        fill={star <= reviewRating ? 'var(--color-star)' : 'none'}
        stroke={star <= reviewRating ? 'var(--color-star)' : 'var(--color-gray-300)'}
        strokeWidth="1.5"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  ));
}

function ProductTabs({
  product,
  approvedReviews,
  writtenReviewCount,
  averageReviewRating,
  activeTab,
  showReviewForm,
  reviewRating,
  reviewText,
  reviewSubmitted,
  isLoadingReviews,
  reviewError,
  onActiveTabChange,
  onShowReviewFormChange,
  onReviewRatingChange,
  onReviewTextChange,
  onSubmitReview,
  onReviewButtonClick,
}) {
  return (
    <section className="pdp-tabs-section">
      <div className="container">
        <div className="pdp-tabs">
          <button
            className={`pdp-tabs__btn ${activeTab === 'description' ? 'pdp-tabs__btn--active' : ''}`}
            onClick={() => onActiveTabChange('description')}
          >
            Description
          </button>
          <button
            className={`pdp-tabs__btn ${activeTab === 'details' ? 'pdp-tabs__btn--active' : ''}`}
            onClick={() => onActiveTabChange('details')}
          >
            Product Details
          </button>
          <button
            className={`pdp-tabs__btn ${activeTab === 'reviews' ? 'pdp-tabs__btn--active' : ''}`}
            onClick={() => onActiveTabChange('reviews')}
          >
            Reviews ({writtenReviewCount})
          </button>
        </div>

        <div className="pdp-tab-content">
          {activeTab === 'description' && (
            <div className="pdp-tab-description">
              <p>{product.description}</p>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="pdp-tab-details">
              <table className="pdp-details-table">
                <tbody>
                  {Object.entries(product.details).map(([key, value]) => (
                    <tr key={key}>
                      <td className="pdp-details-table__label">{key}</td>
                      <td className="pdp-details-table__value">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="pdp-tab-reviews">
              <div className="pdp-reviews-summary">
                <div className="pdp-reviews-summary__score">
                  {writtenReviewCount > 0 ? (
                    <>
                      <span className="pdp-reviews-summary__number">{averageReviewRating}</span>
                      <div className="pdp-reviews-summary__stars">
                        <StarRating rating={Number(averageReviewRating)} size={20} />
                      </div>
                      <span className="pdp-reviews-summary__count">
                        Based on {writtenReviewCount} written reviews
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="pdp-reviews-summary__stars">
                        <StarRating rating={0} size={20} />
                      </div>
                      <span className="pdp-reviews-summary__count">
                        Be the first to write a review.
                      </span>
                    </>
                  )}
                </div>
                <button
                  className="pdp-reviews-summary__write-btn"
                  onClick={onReviewButtonClick}
                >
                  Write a Review
                </button>
              </div>

              {reviewSubmitted && (
                <div className="pdp-review-success">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Thank you! Your review has been submitted and is pending approval.
                </div>
              )}

              {reviewError && !showReviewForm && (
                <div className="pdp-reviews-empty">
                  <p>{reviewError}</p>
                </div>
              )}

              {showReviewForm && (
                <div className="pdp-review-form">
                  <h4 className="pdp-review-form__title">Write Your Review</h4>
                  <div className="pdp-review-form__stars-row">
                    <span>Your Rating:</span>
                    <div className="pdp-review-form__stars">
                      <ClickableStars
                        reviewRating={reviewRating}
                        onRatingChange={onReviewRatingChange}
                      />
                    </div>
                  </div>
                  <textarea
                    className="pdp-review-form__textarea"
                    placeholder="Share your experience with this product..."
                    value={reviewText}
                    onChange={(event) => onReviewTextChange(event.target.value)}
                    rows={4}
                  />
                  <div className="pdp-review-form__actions">
                    <button
                      className="pdp-review-form__submit"
                      onClick={onSubmitReview}
                      disabled={reviewRating === 0 || reviewText.trim() === ''}
                    >
                      Submit Review
                    </button>
                    <button
                      className="pdp-review-form__cancel"
                      onClick={() => onShowReviewFormChange(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="pdp-reviews-list">
                {isLoadingReviews ? (
                  <div className="pdp-reviews-empty">
                    <p>Loading reviews...</p>
                  </div>
                ) : approvedReviews.length > 0 ? (
                  approvedReviews.map((review) => (
                    <div key={review.id} className="pdp-review-card">
                      <div className="pdp-review-card__header">
                        <div className="pdp-review-card__avatar">
                          {review.author.charAt(0)}
                        </div>
                        <div>
                          <p className="pdp-review-card__author">{review.author}</p>
                          <p className="pdp-review-card__date">{review.date}</p>
                        </div>
                        <div className="pdp-review-card__stars">
                          <StarRating rating={review.rating} size={14} />
                        </div>
                      </div>
                      <p className="pdp-review-card__text">{review.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="pdp-reviews-empty">
                    <p>No written reviews yet. Be the first to write a review.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProductTabs;
