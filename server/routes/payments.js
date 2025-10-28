import express from "express";
import authMiddleware from "../middleware/auth.js";
import requireUser from "../middleware/requireUser.js";
import { getCart, addItemToCart, removeCartItem, decrementCartItem } from "../controllers/cartController.js";
import { checkoutCart } from "../controllers/paymentsController.js";

const router = express.Router();

router.get("/cart", authMiddleware, requireUser, getCart);
router.post("/cart/items", authMiddleware, requireUser, addItemToCart);
router.delete("/cart/items/:itemId", authMiddleware, requireUser, removeCartItem);
router.patch("/cart/items/:itemId", authMiddleware, requireUser, decrementCartItem);
router.post("/cart/checkout", authMiddleware, requireUser, checkoutCart);

export default router;
