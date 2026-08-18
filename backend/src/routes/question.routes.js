import express from "express";

import auth from "../middleware/auth.middleware.js";
import admin from "../middleware/admin.middleware.js";
import validate from "../middleware/validate.middleware.js";

import { questionSchema } from "../validations/question.validation.js";

import {
  createQuestion,
  getQuestionsByQuiz,
  getQuestionById,
  deleteQuestion
} from "../controllers/question.controller.js";

const router = express.Router();

router.post(
  "/",
  auth,
  admin,
  validate(questionSchema),
  createQuestion
);

router.get(
  "/quiz/:quizId",
  auth,
  getQuestionsByQuiz
);

router.get(
  "/:id",
  auth,
  getQuestionById
);

router.delete(
  "/:id",
  auth,
  admin,
  deleteQuestion
);

export default router;