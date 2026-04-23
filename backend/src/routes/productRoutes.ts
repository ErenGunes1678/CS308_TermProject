import { Router } from "express";
import { getAllProducts, getProductById, addProduct, editProduct, removeProduct } from "../controllers/productController";

const router = Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", addProduct);
router.put("/:id", editProduct);
router.delete("/:id", removeProduct);

export default router;
