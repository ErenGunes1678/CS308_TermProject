const toNumber = (value: unknown) => {
    if (value === null || value === undefined) return null;

    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? null : numberValue;
};

const getDiscount = (price: number | null, originalPrice: number | null) => {
    if (!price || !originalPrice || originalPrice <= price) return null;

    return Math.round(((originalPrice - price) / originalPrice) * 100);
};

export const mapProductForFrontend = (product: any) => {
    const plainProduct = product?.get ? product.get({ plain: true }) : product;
    const price = toNumber(plainProduct.price) ?? 0;
    const originalPrice = toNumber(plainProduct.original_price);
    const stock = Number(plainProduct.quantity_in_stock ?? 0);

    return {
        id: plainProduct.id,
        name: plainProduct.name,
        brand: plainProduct.brand,
        category: plainProduct.category,
        subcategory: plainProduct.subcategory,
        price,
        originalPrice,
        rating: toNumber(plainProduct.rating) ?? 0,
        reviewCount: Number(plainProduct.review_count ?? 0),
        image: plainProduct.image,
        badge: plainProduct.badge,
        discount: getDiscount(price, originalPrice),
        outOfStock: stock === 0,
        lowStock: stock > 0 && stock <= 10 ? stock : null,
        description: plainProduct.description,
        quantity_in_stock: stock,
        model: plainProduct.model,
        serial_number: plainProduct.serial_number,
        warranty_status: plainProduct.warranty_status,
        distributor_info: plainProduct.distributor_info,
    };
};
