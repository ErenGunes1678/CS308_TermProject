function HomeReviews({ reviews }) {
  return (
    <section className="reviews-section">
      <div className="container">
        <div className="reviews-section__header">
          <p className="section-label">WHAT THEY SAY</p>
          <h2 className="section-title">Loved by Thousands</h2>
        </div>
        <div className="reviews-grid">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-card__stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} width="18" height="18" viewBox="0 0 24 24" fill="var(--color-star)" stroke="var(--color-star)" strokeWidth="1">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="review-card__text">"{review.text}"</p>
              <div className="review-card__author">
                <div className="review-card__avatar">{review.initial}</div>
                <div>
                  <p className="review-card__name">{review.author}</p>
                  <p className="review-card__role">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HomeReviews;
