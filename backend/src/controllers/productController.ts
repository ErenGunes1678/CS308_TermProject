import { Request, Response } from "express";
import { pool } from "../config/db";

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT p.*, c.name AS category_name
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             ORDER BY p.created_at DESC`
        );

        return res.status(200).json({
            message: "Products fetched successfully",
            products: result.rows
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
            discounted_price,
            warranty_status,
            distributor_info,
            category_id
        } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({
                message: "Name and price are required"
            });
        }

        if (serial_number) {
            const existing = await pool.query(
                "SELECT id FROM products WHERE serial_number = $1",
                [serial_number]
            );
            if (existing.rows.length > 0) {
                return res.status(409).json({
                    message: "A product with this serial number already exists"
                });
            }
        }

        const result = await pool.query(
            `INSERT INTO products
                (name, model, serial_number, description, quantity_in_stock, price,
                 discounted_price, warranty_status, distributor_info, category_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [
                name,
                model || null,
                serial_number || null,
                description || null,
                quantity_in_stock ?? 0,
                price,
                discounted_price || null,
                warranty_status ?? false,
                distributor_info || null,
                category_id || null
            ]
        );

        return res.status(201).json({
            message: "Product added successfully",
            product: result.rows[0]
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

        const existing = await pool.query(
            "SELECT id FROM products WHERE id = $1",
            [id]
        );

        if (existing.rows.length === 0) {
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
            discounted_price,
            warranty_status,
            distributor_info,
            category_id
        } = req.body;

        const result = await pool.query(
            `UPDATE products SET
                name              = COALESCE($1, name),
                model             = COALESCE($2, model),
                serial_number     = COALESCE($3, serial_number),
                description       = COALESCE($4, description),
                quantity_in_stock = COALESCE($5, quantity_in_stock),
                price             = COALESCE($6, price),
                discounted_price  = COALESCE($7, discounted_price),
                warranty_status   = COALESCE($8, warranty_status),
                distributor_info  = COALESCE($9, distributor_info),
                category_id       = COALESCE($10, category_id)
             WHERE id = $11
             RETURNING *`,
            [
                name || null,
                model || null,
                serial_number || null,
                description || null,
                quantity_in_stock ?? null,
                price ?? null,
                discounted_price ?? null,
                warranty_status ?? null,
                distributor_info || null,
                category_id || null,
                id
            ]
        );

        return res.status(200).json({
            message: "Product updated successfully",
            product: result.rows[0]
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

        const existing = await pool.query(
            "SELECT id FROM products WHERE id = $1",
            [id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        await pool.query("DELETE FROM products WHERE id = $1", [id]);

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
