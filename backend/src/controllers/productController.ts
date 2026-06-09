import { Request, Response } from "express";
import { Op } from "sequelize";
import db from "../entities";
import { mapProductForFrontend } from "../utils/productMapper";

const Product = db.products;
const Category = db.categories;

const categoryExists = async (slug?: string) => {
    if (!slug) return false;
    const category = await Category.findOne({ where: { slug } });
    return Boolean(category);
};

export const getAllProducts = async (_req: Request, res: Response) => {
    try {
        const products = await Product.findAll({
            where: {
                price: { [Op.gt]: 0 }
            },
            order: [["id", "ASC"]]
        });

        return res.status(200).json({
            message: "Products fetched successfully",
            products: products.map(mapProductForFrontend)
        });
    } catch (error) {
        console.error("Get all products error:", error);
        return res.status(500).json({
            message: "Server error while fetching products"
        });
    }
};

export const getManageProducts = async (_req: Request, res: Response) => {
    try {
        const products = await Product.findAll({
            order: [["id", "ASC"]]
        });

        return res.status(200).json({
            message: "Products fetched successfully",
            products: products.map(mapProductForFrontend)
        });
    } catch (error) {
        console.error("Get manage products error:", error);
        return res.status(500).json({
            message: "Server error while fetching products"
        });
    }
};

export const getPendingPricingProducts = async (_req: Request, res: Response) => {
    try {
        const products = await Product.findAll({
            where: {
                price: 0
            },
            order: [["id", "ASC"]]
        });

        return res.status(200).json({
            message: "Pending pricing products fetched successfully",
            products: products.map(mapProductForFrontend)
        });
    } catch (error) {
        console.error("Get pending pricing products error:", error);
        return res.status(500).json({
            message: "Server error while fetching pending pricing products"
        });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        if (!product || Number(product.get("price")) <= 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        return res.status(200).json({
            message: "Product fetched successfully",
            product: mapProductForFrontend(product)
        });
    } catch (error) {
        console.error("Get product by id error:", error);
        return res.status(500).json({
            message: "Server error while fetching product"
        });
    }
};

export const updateProductPrice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { price, original_price } = req.body;
        const nextPrice = Number(price);

        if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
            return res.status(400).json({
                message: "A valid product price greater than 0 is required"
            });
        }

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const oldPrice = Number(product.get("price"));

        await product.update({
            price: nextPrice,
            ...(original_price !== undefined && { original_price })
        });

        if (nextPrice < oldPrice) {
            const wishlistEntries = await db.wishlists.findAll({
                where: { product_id: id },
                attributes: ["user_id"],
            });

            await Promise.all(
                wishlistEntries.map((entry: any) =>
                    db.price_drop_notifications.create({
                        user_id: entry.user_id,
                        product_id: id,
                        old_price: oldPrice,
                        new_price: nextPrice,
                    })
                )
            );
        }

        return res.status(200).json({
            message: "Product price updated successfully",
            product: mapProductForFrontend(product)
        });
    } catch (error) {
        console.error("Update product price error:", error);
        return res.status(500).json({
            message: "Server error while updating product price"
        });
    }
};

export const addProduct = async (req: Request, res: Response) => {
    try {
        const {
            name,
            brand,
            category,
            subcategory,
            model,
            serial_number,
            description,
            quantity_in_stock,
            price,
            original_price,
            rating,
            review_count,
            image,
            badge,
            warranty_status,
            distributor_info
        } = req.body;

        if (!name || !brand || !category || !subcategory || !model || !serial_number || !image || price === undefined) {
            return res.status(400).json({
                message: "Name, brand, category, subcategory, model, serial number, image, and price are required"
            });
        }

        if (!(await categoryExists(category))) {
            return res.status(400).json({
                message: "Category does not exist"
            });
        }

        if (serial_number || model) {
            const existing = await Product.findOne({
                where: {
                    [Op.or]: [
                        { serial_number },
                        { model }
                    ]
                }
            });

            if (existing) {
                return res.status(409).json({
                    message: "A product with this serial number or model already exists"
                });
            }
        }

        const product = await Product.create({
            name,
            brand,
            category,
            subcategory,
            model,
            serial_number,
            description,
            quantity_in_stock: quantity_in_stock ?? 0,
            price,
            original_price,
            rating: rating ?? 4.0,
            review_count: review_count ?? 0,
            image,
            badge,
            warranty_status: warranty_status ?? false,
            distributor_info
        });

        return res.status(201).json({
            message: "Product added successfully",
            product: mapProductForFrontend(product)
        });
    } catch (error) {
        console.error("Add product error:", error);
        return res.status(500).json({
            message: "Server error while adding product"
        });
    }
};

export const editProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const {
            name,
            brand,
            category,
            subcategory,
            model,
            serial_number,
            description,
            quantity_in_stock,
            rating,
            review_count,
            image,
            badge,
            warranty_status,
            distributor_info
        } = req.body;

        if (category !== undefined && !(await categoryExists(category))) {
            return res.status(400).json({
                message: "Category does not exist"
            });
        }

        await product.update({
            ...(name !== undefined && { name }),
            ...(brand !== undefined && { brand }),
            ...(category !== undefined && { category }),
            ...(subcategory !== undefined && { subcategory }),
            ...(model !== undefined && { model }),
            ...(serial_number !== undefined && { serial_number }),
            ...(description !== undefined && { description }),
            ...(quantity_in_stock !== undefined && { quantity_in_stock }),
            ...(rating !== undefined && { rating }),
            ...(review_count !== undefined && { review_count }),
            ...(image !== undefined && { image }),
            ...(badge !== undefined && { badge }),
            ...(warranty_status !== undefined && { warranty_status }),
            ...(distributor_info !== undefined && { distributor_info }),
        });

        return res.status(200).json({
            message: "Product updated successfully",
            product: mapProductForFrontend(product)
        });
    } catch (error) {
        console.error("Edit product error:", error);
        return res.status(500).json({
            message: "Server error while updating product"
        });
    }
};

export const removeProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        await product.destroy();

        return res.status(200).json({
            message: "Product removed successfully"
        });
    } catch (error) {
        console.error("Remove product error:", error);
        return res.status(500).json({
            message: "Server error while removing product"
        });
    }
};
