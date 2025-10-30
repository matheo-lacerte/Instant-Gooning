import express from "express";
import authMiddleware from "../middleware/auth.js";
import requireUser from "../middleware/requireUser.js";
import { getCart, addItemToCart, removeCartItem, decrementCartItem } from "../controllers/cartController.js";
import { checkoutCart, getCheckoutSessionDetails, clearCartFromSession } from "../controllers/paymentsController.js";

const router = express.Router();

router.get("/cart", authMiddleware, requireUser, getCart);
router.post("/cart/items", authMiddleware, requireUser, addItemToCart);
router.delete("/cart/items/:itemId", authMiddleware, requireUser, removeCartItem);
router.patch("/cart/items/:itemId", authMiddleware, requireUser, decrementCartItem);
router.post("/cart/checkout", authMiddleware, requireUser, checkoutCart);
router.get("/session/details", authMiddleware, requireUser, getCheckoutSessionDetails);
router.post("/session/clear-cart", authMiddleware, requireUser, clearCartFromSession);

export default router;
