import { useEffect, useLayoutEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ProductDetailsPage.css';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import CartToast from '../../components/product/product-details/CartToast';
import ProductBreadcrumb from '../../components/product/product-details/ProductBreadcrumb';
import ProductGallery from '../../components/product/product-details/ProductGallery';
import ProductInfo from '../../components/product/product-details/ProductInfo';
import ProductTabs from '../../components/product/product-details/ProductTabs';
import { getProductById } from '../../services/productService';

const CATEGORY_LABELS = {
    makeup: 'Makeup',
    skincare: 'Skincare',
    haircare: 'Haircare',
    'men-care': 'Men Care',
};

const mapApiProductToDetails = (apiProduct) => {
    const stock = Number(apiProduct.quantity_in_stock ?? 0);

    return {
        ...apiProduct,
        category: CATEGORY_LABELS[apiProduct.category] || apiProduct.category || 'Products',
        categorySlug: apiProduct.category || 'products',
        price: Number(apiProduct.price ?? 0),
        originalPrice:
            apiProduct.originalPrice === null || apiProduct.originalPrice === undefined
                ? null
                : Number(apiProduct.originalPrice),
        rating: Number(apiProduct.rating ?? 0),
        reviewCount: Number(apiProduct.reviewCount ?? 0),
        stock,
        images: [apiProduct.image],
        details: {
            'Serial Number': apiProduct.serial_number || 'N/A',
            Model: apiProduct.model || 'N/A',
            'Quantity in Stock': stock,
            Warranty: apiProduct.warranty_status ? 'Active' : 'Not active',
            Distributor: apiProduct.distributor_info || 'N/A',
        },
        reviews: [],
    };
};

const ProductDetailsPage = () => {
    const { id } = useParams();
    const [apiProduct, setApiProduct] = useState(null);
    const [isLoadingProduct, setIsLoadingProduct] = useState(true);
    const product = apiProduct;
    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();

    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [cartToast, setCartToast] = useState(null);

    // Review form
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        let isMounted = true;

        const loadProduct = async () => {
            setIsLoadingProduct(true);
            setApiProduct(null);

            try {
                const productFromApi = await getProductById(id);

                if (isMounted && productFromApi) {
                    setApiProduct(mapApiProductToDetails(productFromApi));
                    setSelectedImage(0);
                    setQuantity(1);
                }
            } catch {
                if (isMounted) {
                    setApiProduct(null);
                }
            } finally {
                if (isMounted) {
                    setIsLoadingProduct(false);
                }
            }
        };

        loadProduct();

        return () => {
            isMounted = false;
        };
    }, [id]);

    useEffect(() => {
        if (!cartToast) return undefined;

        const toastTimer = window.setTimeout(() => {
            setCartToast(null);
        }, 2500);

        return () => {
            window.clearTimeout(toastTimer);
        };
    }, [cartToast]);

    if (!product && isLoadingProduct) {
        return (
            <div className="pdp pdp-skeleton">
                <div className="pdp-breadcrumb">
                    <div className="pdp-breadcrumb__inner container">
                        <span className="pdp-skeleton__line pdp-skeleton__line--breadcrumb" />
                    </div>
                </div>

                <section className="pdp-main container">
                    <div className="pdp-gallery">
                        <div className="pdp-gallery__main pdp-skeleton__box" />
                        <div className="pdp-gallery__thumbs">
                            <span className="pdp-gallery__thumb pdp-skeleton__box" />
                            <span className="pdp-gallery__thumb pdp-skeleton__box" />
                            <span className="pdp-gallery__thumb pdp-skeleton__box" />
                        </div>
                    </div>

                    <div className="pdp-info">
                        <span className="pdp-skeleton__line pdp-skeleton__line--brand" />
                        <span className="pdp-skeleton__line pdp-skeleton__line--title" />
                        <span className="pdp-skeleton__line pdp-skeleton__line--rating" />
                        <span className="pdp-skeleton__line pdp-skeleton__line--price" />
                        <span className="pdp-skeleton__line pdp-skeleton__line--text" />
                        <span className="pdp-skeleton__line pdp-skeleton__line--text-short" />
                        <span className="pdp-skeleton__line pdp-skeleton__line--button" />
                    </div>
                </section>

                <section className="pdp-tabs-section">
                    <div className="container">
                        <div className="pdp-tabs">
                            <span className="pdp-skeleton__line pdp-skeleton__line--tab" />
                            <span className="pdp-skeleton__line pdp-skeleton__line--tab" />
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="pdp-not-found">
                <h2>Product not found</h2>
                <p>The product you're looking for doesn't exist.</p>
                <Link to="/products" className="pdp-not-found__btn">
                    Browse Products &rarr;
                </Link>
            </div>
        );
    }

    const isOutOfStock = product.stock === 0;
    const isLowStock = product.stock > 0 && product.stock <= 10;
    const isWishlisted = isInWishlist(product.id);
    const approvedReviews = product.reviews.filter((review) => review.approved);

    const handleAddToCart = () => {
        if (isOutOfStock) return;

        const selectedProduct = {
            ...product,
            image: product.images[selectedImage],
        };

        addToCart(selectedProduct, quantity);

        setCartToast({
            productName: product.name,
            quantity,
            totalPrice: product.price * quantity,
        });
    };

    const handleToggleWishlist = () => {
        toggleWishlist({
            ...product,
            image: product.images[selectedImage],
        });
    };

    const decreaseQuantity = () => {
        setQuantity((currentQuantity) => Math.max(1, currentQuantity - 1));
    };

    const increaseQuantity = () => {
        setQuantity((currentQuantity) => Math.min(product.stock, currentQuantity + 1));
    };

    const handleSubmitReview = (e) => {
        e.preventDefault();
        if (reviewRating === 0 || reviewText.trim() === '') return;
        // TODO: Send to API — comment needs approval by product manager
        setReviewSubmitted(true);
        setShowReviewForm(false);
        setReviewRating(0);
        setReviewText('');
    };

    return (
        <div className="pdp">
            <ProductBreadcrumb product={product} />

            <section className="pdp-main container">
                <ProductGallery
                    product={product}
                    selectedImage={selectedImage}
                    onSelectImage={setSelectedImage}
                />

                <ProductInfo
                    product={product}
                    quantity={quantity}
                    isOutOfStock={isOutOfStock}
                    isLowStock={isLowStock}
                    isWishlisted={isWishlisted}
                    onDecreaseQuantity={decreaseQuantity}
                    onIncreaseQuantity={increaseQuantity}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                />
            </section>

            <CartToast cartToast={cartToast} />

            <ProductTabs
                product={product}
                approvedReviews={approvedReviews}
                activeTab={activeTab}
                showReviewForm={showReviewForm}
                reviewRating={reviewRating}
                reviewText={reviewText}
                reviewSubmitted={reviewSubmitted}
                onActiveTabChange={setActiveTab}
                onShowReviewFormChange={setShowReviewForm}
                onReviewRatingChange={setReviewRating}
                onReviewTextChange={setReviewText}
                onSubmitReview={handleSubmitReview}
            />
        </div>
    );
};

export default ProductDetailsPage;
