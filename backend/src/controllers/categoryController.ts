import { Request, Response } from "express";
import db, { sequelize } from "../entities";

const Category = db["categories"];
const Product = db["products"];

const normalizeSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatCategoryName = (value: string): string =>
  normalizeSlug(value)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.findAll({
      order: [["name", "ASC"]],
    });
    const products = await Product.findAll({
      attributes: ["category", "subcategory"],
    });

    const subcategoriesByCategory = new Map<string, Set<string>>();
    products.forEach((product: any) => {
      const category = normalizeSlug(String(product.get("category") || ""));
      const subcategory = String(product.get("subcategory") || "").trim();

      if (!category || !subcategory) {
        return;
      }

      if (!subcategoriesByCategory.has(category)) {
        subcategoriesByCategory.set(category, new Set());
      }

      subcategoriesByCategory.get(category)?.add(subcategory);
    });

    const categoriesBySlug = new Map<string, any>();
    categories.forEach((category: any) => {
      const plainCategory = category.get({ plain: true });
      const slug = normalizeSlug(plainCategory.name);

      if (!slug || categoriesBySlug.has(slug)) {
        return;
      }

      categoriesBySlug.set(slug, {
        ...plainCategory,
        name: formatCategoryName(plainCategory.name),
        slug,
      });
    });

    subcategoriesByCategory.forEach((_subcategories, slug) => {
      if (!categoriesBySlug.has(slug)) {
        categoriesBySlug.set(slug, {
          id: slug,
          name: formatCategoryName(slug),
          slug,
        });
      }
    });

    const categoriesWithSubcategories = Array.from(categoriesBySlug.values())
      .map((category) => ({
        ...category,
        subcategories: Array.from(subcategoriesByCategory.get(category.slug) || []).sort((a, b) =>
          a.localeCompare(b)
        ),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return res.status(200).json({
      message: "Categories fetched successfully",
      categories: categoriesWithSubcategories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({ message: "Server error while fetching categories" });
  }
};

export const addCategory = async (req: Request, res: Response) => {
  try {
    const name = String(req.body?.name || "").trim();

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existing = await Category.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const category = await Category.create({ name });
    return res.status(201).json({
      message: "Category added successfully",
      category,
    });
  } catch (error) {
    console.error("Add category error:", error);
    return res.status(500).json({ message: "Server error while adding category" });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const name = String(req.body?.name || "").trim();

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const currentName = String(category.get("name") || "");
    if (currentName === name) {
      return res.status(200).json({
        message: "Category updated successfully",
        category,
      });
    }

    const existing = await Category.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ message: "Category name already exists" });
    }

    await category.update({ name });
    await Product.update({ category: name }, { where: { category: currentName } });

    return res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);
    return res.status(500).json({ message: "Server error while updating category" });
  }
};

export const removeCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const categoryName = String(category.get("name") || "");

    await sequelize.transaction(async (transaction) => {
      await Product.destroy({ where: { category: categoryName }, transaction });
      await category.destroy({ transaction });
    });

    return res.status(200).json({ message: "Category removed successfully" });
  } catch (error) {
    console.error("Remove category error:", error);
    return res.status(500).json({ message: "Server error while removing category" });
  }
};
