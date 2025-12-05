import express from "express";
import bodyParser from "body-parser";
import { stripeWebhook } from "../controllers/stripeWebhookController.js";

const router = express.Router();

router.post(
  "/webhook/stripe",
  bodyParser.raw({ type: "application/json" }),
  stripeWebhook
);

export default router;
