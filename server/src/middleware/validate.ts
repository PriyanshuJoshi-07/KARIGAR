import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export function validate(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    next();
    return;
  }
  res.status(400).json({
    error: "Validation failed",
    details: errors.array().map((e) => ({ field: "path" in e ? e.path : "", message: e.msg }))
  });
}
