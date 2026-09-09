import { Router } from "express";
import { addToCart, updateCart, clearCart, getCart } from "../controllers/cartController.js";

export const cartRoutes = Router();

cartRoutes.get("/", getCart);
cartRoutes.post("/", addToCart);
cartRoutes.put("/", updateCart);
cartRoutes.delete("/", clearCart);
