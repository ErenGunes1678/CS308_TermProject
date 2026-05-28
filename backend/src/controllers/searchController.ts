import { Request, Response } from "express";
import { Op, Order, WhereOptions } from "sequelize";
import db from "../entities";
import { mapProductForFrontend } from "../utils/productMapper";

const Product = db["products"];

export const searchProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { q, category, subcategory, brands, minPrice, maxPrice, inStock, minRating, sortBy } = req.query;

        const where: WhereOptions = {
            price: { [Op.gt]: 0 }
        };

        if (q) {
            (where as any)[Op.or] = [
                { name:        { [Op.iLike]: `%${q}%` } },
                { brand:       { [Op.iLike]: `%${q}%` } },
                { description: { [Op.iLike]: `%${q}%` } },
            ];
        }

        if (category)    (where as any).category    = category;
        if (subcategory) (where as any).subcategory = subcategory;

        if (brands) {
            const brandList = Array.isArray(brands)
                ? brands
                : (brands as string).split(",").map(b => b.trim());
            (where as any).brand = { [Op.in]: brandList };
        }

        if (minPrice || maxPrice) {
            const priceFilter: any = { [Op.gt]: 0 };
            if (minPrice) priceFilter[Op.gte] = Number(minPrice);
            if (maxPrice) priceFilter[Op.lte] = Number(maxPrice);
            (where as any).price = priceFilter;
        }

        if (inStock === "true") {
            (where as any).quantity_in_stock = { [Op.gt]: 0 };
        }

        if (minRating) {
            (where as any).rating = { [Op.gte]: Number(minRating) };
        }

        const orderMap: Record<string, Order> = {
            price_asc:   [["price",  "ASC"]],
            price_desc:  [["price",  "DESC"]],
            rating_desc: [["rating", "DESC"]],
            newest:      [["id",     "DESC"]],
        };
        const order: Order = orderMap[sortBy as string] ?? [["id", "ASC"]];

        const products = await Product.findAll({ where, order });

        res.status(200).json({
            message: "Search results fetched successfully",
            products: products.map(mapProductForFrontend),
            total: products.length,
        });
    } catch (error) {
        console.error("Search products error:", error);
        res.status(500).json({ message: "Server error while searching products" });
    }
};
