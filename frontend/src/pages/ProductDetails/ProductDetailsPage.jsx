import { useEffect, useState } from 'react';
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

// TODO: Replace with API call using the id param
const PLACEHOLDER = 'https://placehold.co/600x600/f5f5f5/999?text=Product';

const ALL_PRODUCTS = [
    {
        id: 1,
        name: 'Velvet Matte Lipstick',
        brand: 'LumaBelle',
        category: 'Makeup',
        categorySlug: 'makeup',
        price: 28,
        originalPrice: 35,
        discount: 20,
        rating: 4,
        reviewCount: 312,
        stock: 24,
        badge: 'BEST',
        images: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
        description:
            'A luxuriously smooth matte lipstick that delivers intense, long-lasting color in a single swipe. Enriched with vitamin E and jojoba oil to keep your lips hydrated all day without feathering or fading.',
        details: {
            'Serial Number': 'LB-VML-001',
            Model: 'Velvet Matte Pro',
            Weight: '3.5g / 0.12 oz',
            Warranty: '12 months',
            Distributor: 'LumaBelle International',
        },
        reviews: [
            {
                id: 1,
                author: 'Sophie L.',
                rating: 5,
                date: 'Mar 15, 2026',
                text: 'Absolutely love this lipstick! The color payoff is incredible and it lasts all day without drying out my lips.',
                approved: true,
            },
            {
                id: 2,
                author: 'Emma K.',
                rating: 4,
                date: 'Mar 10, 2026',
                text: 'Beautiful shade and smooth application. Would love more color options in this formula.',
                approved: true,
            },
            {
                id: 3,
                author: 'Mia T.',
                rating: 5,
                date: 'Feb 28, 2026',
                text: 'Best matte lipstick I have ever tried. The texture is so comfortable and the packaging is gorgeous.',
                approved: true,
            },
        ],
    },
    {
        id: 2,
        name: 'Radiance Boost Serum',
        brand: 'GlowLab',
        category: 'Skincare',
        categorySlug: 'skincare',
        price: 54,
        originalPrice: 68,
        discount: 21,
        rating: 4.5,
        reviewCount: 487,
        stock: 15,
        badge: 'NEW',
        images: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
        description:
            'A powerful brightening serum formulated with vitamin C, niacinamide, and hyaluronic acid. Targets dullness, dark spots, and uneven skin tone for a radiant, dewy complexion.',
        details: {
            'Serial Number': 'GL-RBS-002',
            Model: 'Radiance Pro',
            Weight: '30ml / 1 fl oz',
            Warranty: '6 months',
            Distributor: 'GlowLab Cosmetics',
        },
        reviews: [
            {
                id: 1,
                author: 'Anna R.',
                rating: 5,
                date: 'Mar 18, 2026',
                text: 'My skin has never looked better! This serum gave me visible results within two weeks.',
                approved: true,
            },
        ],
    },
    {
        id: 3,
        name: 'Pro Glow Eyeshadow Palette',
        brand: 'LumaBelle',
        category: 'Makeup',
        categorySlug: 'makeup',
        price: 62,
        originalPrice: null,
        discount: null,
        rating: 4.5,
        reviewCount: 541,
        stock: 18,
        badge: 'BEST',
        images: [PLACEHOLDER, PLACEHOLDER],
        description:
            'A versatile 12-shade eyeshadow palette featuring a curated mix of mattes, shimmers, and metallic finishes. Highly pigmented and blendable for endless eye looks.',
        details: {
            'Serial Number': 'LB-PGP-003',
            Model: 'Pro Glow 12',
            Weight: '18g / 0.63 oz',
            Warranty: '12 months',
            Distributor: 'LumaBelle International',
        },
        reviews: [],
    },
    {
        id: 6,
        name: 'Luxury Perfume Collection',
        brand: 'Aurore',
        category: 'Makeup',
        categorySlug: 'makeup',
        price: 89,
        originalPrice: null,
        discount: null,
        rating: 4.5,
        reviewCount: 234,
        stock: 9,
        badge: 'LIMITED',
        images: [PLACEHOLDER, PLACEHOLDER],
        description:
            'An exquisite set of three signature fragrances, each capturing a different mood — from fresh florals to deep oriental notes. Presented in a luxury gift box.',
        details: {
            'Serial Number': 'AU-LPC-006',
            Model: 'Signature Trio',
            Weight: '3 × 30ml',
            Warranty: '24 months',
            Distributor: 'Aurore Paris',
        },
        reviews: [],
    },
    {
        id: 7,
        name: 'Complete Skincare Bundle',
        brand: 'GlowLab',
        category: 'Skincare',
        categorySlug: 'skincare',
        price: 118,
        originalPrice: 160,
        discount: 26,
        rating: 4,
        reviewCount: 89,
        stock: 0,
        badge: 'SALE',
        images: [PLACEHOLDER, PLACEHOLDER],
        description:
            'Everything you need for a complete skincare routine. Includes cleanser, toner, serum, moisturizer, and SPF — all formulated to work together for maximum results.',
        details: {
            'Serial Number': 'GL-CSB-007',
            Model: 'Complete Set',
            Weight: '5-piece set',
            Warranty: '6 months',
            Distributor: 'GlowLab Cosmetics',
        },
        reviews: [],
    },
];

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
        images: [apiProduct.image || PLACEHOLDER],
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
    const fallbackProduct = ALL_PRODUCTS.find((p) => p.id === Number(id));
    const [apiProduct, setApiProduct] = useState(null);
    const [isLoadingProduct, setIsLoadingProduct] = useState(true);
    const product = apiProduct || fallbackProduct;
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

    useEffect(() => {
        let isMounted = true;

        const loadProduct = async () => {
            setIsLoadingProduct(true);

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
            <div className="pdp-not-found">
                <h2>Loading product...</h2>
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
