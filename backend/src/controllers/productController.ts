import { Request, Response } from "express";
import db from "../entities";

const Product = db["products"];

export const getAllProducts = async (_req: Request, res: Response) => {
    try {
        const products = await Product.findAll();

        return res.status(200).json({
            message: "Products fetched successfully",
            products
        });
    } catch (error) {
        console.error("Get all products error:", error);
        return res.status(500).json({
            message: "Server error while fetching products"
        });
    }
};

export const addProduct = async (req: Request, res: Response) => {
    try {
        const {
            name,
            model,
            serial_number,
            description,
            quantity_in_stock,
            price,
            warranty_status,
            distributor_info
        } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({
                message: "Name and price are required"
            });
        }

        if (serial_number) {
            const existing = await Product.findOne({ where: { serial_number } });
            if (existing) {
                return res.status(409).json({
                    message: "A product with this serial number already exists"
                });
            }
        }

        const product = await Product.create({
            name,
            model,
            serial_number,
            description,
            quantity_in_stock: quantity_in_stock ?? 0,
            price,
            warranty_status: warranty_status ?? false,
            distributor_info
        });

        return res.status(201).json({
            message: "Product added successfully",
            product
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
            model,
            serial_number,
            description,
            quantity_in_stock,
            price,
            warranty_status,
            distributor_info
        } = req.body;

        await product.update({
            ...(name !== undefined && { name }),
            ...(model !== undefined && { model }),
            ...(serial_number !== undefined && { serial_number }),
            ...(description !== undefined && { description }),
            ...(quantity_in_stock !== undefined && { quantity_in_stock }),
            ...(price !== undefined && { price }),
            ...(warranty_status !== undefined && { warranty_status }),
            ...(distributor_info !== undefined && { distributor_info }),
        });

        return res.status(200).json({
            message: "Product updated successfully",
            product
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
