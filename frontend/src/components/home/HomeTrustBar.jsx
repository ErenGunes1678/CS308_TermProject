const trustItems = [
  {
    title: 'Free Shipping',
    text: 'On orders over $50',
    icon: (
      <>
        <path d="M5 12h14" />
        <path d="M12 5l7 7-7 7" />
      </>
    ),
  },
  {
    title: 'Easy Returns',
    text: '30-day return policy',
    icon: (
      <>
        <path d="M1 4v6h6" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </>
    ),
  },
  {
    title: 'Authentic Products',
    text: '100% genuine brands',
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  },
  {
    title: 'Loyalty Rewards',
    text: 'Earn points every order',
    icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
  },
];

function HomeTrustBar() {
  return (
    <section className="trust-bar">
      <div className="container trust-bar__inner">
        {trustItems.map((item) => (
          <div key={item.title} className="trust-bar__item">
            <div className="trust-bar__icon trust-bar__icon--pink">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {item.icon}
              </svg>
            </div>
            <div>
              <h4 className="trust-bar__title">{item.title}</h4>
              <p className="trust-bar__text">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HomeTrustBar;
