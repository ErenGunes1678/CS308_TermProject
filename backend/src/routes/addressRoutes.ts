import { Router } from "express";
import {
    createAddress,
    deleteAddress,
    getAddresses,
    setDefaultAddress,
    updateAddress,
} from "../controllers/addressController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/", requireAuth, getAddresses);
router.post("/", requireAuth, createAddress);
router.put("/:id", requireAuth, updateAddress);
router.patch("/:id/default", requireAuth, setDefaultAddress);
router.delete("/:id", requireAuth, deleteAddress);

export default router;
