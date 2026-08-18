import express from "express";

import auth from "../middleware/auth.middleware.js";
import admin from "../middleware/admin.middleware.js";
import validate from "../middleware/validate.middleware.js";

import { quizSchema } from "../validations/quiz.validation.js";

import {

  createQuiz,

  getQuizzes,

  getQuizById,

  updateQuiz,

  deleteQuiz,

  publishQuiz,

  unpublishQuiz

} from "../controllers/quiz.controller.js";

const router = express.Router();

router.get(
  "/",
  auth,
  getQuizzes
);

router.get(
  "/:id",
  auth,
  getQuizById
);

router.post(
  "/",
  auth,
  admin,
  validate(quizSchema),
  createQuiz
);
router.put(
  "/:id",
  auth,
  admin,
  validate(quizSchema),
  updateQuiz
);

router.delete(
  "/:id",
  auth,
  admin,
  deleteQuiz
);

router.patch(
  "/:id/publish",
  auth,
  admin,
  publishQuiz
);

router.patch(
  "/:id/unpublish",
  auth,
  admin,
  unpublishQuiz
);

export default router;