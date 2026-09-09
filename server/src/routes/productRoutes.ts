import { Router } from "express";
import { param } from "express-validator";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  listCategories,
  featuredArtisans
} from "../controllers/productController.js";
import { validate } from "../middleware/validate.js";

export const productRoutes = Router();

productRoutes.get("/", listProducts);
productRoutes.get("/categories", listCategories);
productRoutes.get("/artisans", featuredArtisans);
productRoutes.get("/:id", param("id").isString().notEmpty(), validate, getProduct);
productRoutes.post("/", createProduct);
productRoutes.put("/:id", param("id").isString().notEmpty(), validate, updateProduct);
productRoutes.delete("/:id", param("id").isString().notEmpty(), validate, deleteProduct);
