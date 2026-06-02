import { Request, Response } from "express";
import db from "../entities";

const Category = db["categories"];
const Product = db["products"];

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.findAll({
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      message: "Categories fetched successfully",
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({ message: "Server error while fetching categories" });
  }
};

export const addCategory = async (req: Request, res: Response) => {
  try {
    const name = String(req.body?.name || "").trim();
    const requestedSlug = String(req.body?.slug || "").trim();
    const slug = requestedSlug ? slugify(requestedSlug) : slugify(name);

    if (!name || !slug) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existing = await Category.findOne({ where: { slug } });
    if (existing) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const category = await Category.create({ name, slug });
    return res.status(201).json({
      message: "Category added successfully",
      category,
    });
  } catch (error) {
    console.error("Add category error:", error);
    return res.status(500).json({ message: "Server error while adding category" });
  }
};

export const removeCategory = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ where: { slug } });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const productCount = await Product.count({ where: { category: slug } });
    if (productCount > 0) {
      return res.status(409).json({
        message: "Cannot remove a category while products are assigned to it",
      });
    }

    await category.destroy();
    return res.status(200).json({ message: "Category removed successfully" });
  } catch (error) {
    console.error("Remove category error:", error);
    return res.status(500).json({ message: "Server error while removing category" });
  }
};
