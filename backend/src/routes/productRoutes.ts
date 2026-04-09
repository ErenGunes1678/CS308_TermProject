import { Router } from "express";
import { getAllProducts, addProduct, editProduct, removeProduct } from "../controllers/productController";

const router = Router();

router.get("/", getAllProducts);
router.post("/", addProduct);
router.put("/:id", editProduct);
router.delete("/:id", removeProduct);

export default router;
