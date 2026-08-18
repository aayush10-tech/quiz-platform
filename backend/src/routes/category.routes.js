import express from "express";

import auth from "../middleware/auth.middleware.js";
import admin from "../middleware/admin.middleware.js";
import validate from "../middleware/validate.middleware.js";
import { categorySchema } from "../validations/category.validation.js";

import {

createCategory,

getCategories,

getCategoryById,

updateCategory,

deleteCategory

} from "../controllers/category.controller.js";

const router=express.Router();

router.get("/",auth,getCategories);

router.get("/:id",auth,getCategoryById);

router.post(
  "/",
  auth,
  admin,
  validate(categorySchema),
  createCategory
);
router.put(
  "/:id",
  auth,
  admin,
  validate(categorySchema),
  updateCategory
);
router.delete("/:id",auth,admin,deleteCategory);

export default router;