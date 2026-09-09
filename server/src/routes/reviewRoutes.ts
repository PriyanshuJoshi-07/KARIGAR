import { Router } from "express";
import { createReview } from "../controllers/reviewController.js";

export const reviewRoutes = Router();

reviewRoutes.post("/", createReview);
