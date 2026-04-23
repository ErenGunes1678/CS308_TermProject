import { Link } from 'react-router-dom';

function ProductBreadcrumb({ product }) {
  return (
    <div className="pdp-breadcrumb">
      <div className="container pdp-breadcrumb__inner">
        <Link to="/">Home</Link>
        <span className="pdp-breadcrumb__sep">&rsaquo;</span>
        <Link to={`/category/${product.categorySlug}`}>{product.category}</Link>
        <span className="pdp-breadcrumb__sep">&rsaquo;</span>
        <span className="pdp-breadcrumb__current">{product.name}</span>
      </div>
    </div>
  );
}

export default ProductBreadcrumb;
