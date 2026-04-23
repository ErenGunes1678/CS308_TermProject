function ProductGallery({ product, selectedImage, onSelectImage }) {
  return (
    <div className="pdp-gallery">
      <div className="pdp-gallery__main">
        {product.badge && (
          <span className={`pdp-gallery__badge pdp-gallery__badge--${product.badge.toLowerCase()}`}>
            {product.badge}
          </span>
        )}
        {product.discount && (
          <span className="pdp-gallery__discount">-{product.discount}%</span>
        )}
        <img
          src={product.images[selectedImage]}
          alt={product.name}
          className="pdp-gallery__image"
        />
      </div>
      <div className="pdp-gallery__thumbs">
        {product.images.map((img, index) => (
          <button
            key={index}
            className={`pdp-gallery__thumb ${selectedImage === index ? 'pdp-gallery__thumb--active' : ''}`}
            onClick={() => onSelectImage(index)}
          >
            <img src={img} alt={`${product.name} view ${index + 1}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default ProductGallery;
