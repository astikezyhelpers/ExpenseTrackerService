import express from 'express';
import { addExpense, deleteExpense, getExpenseById, getUserExpenses, updateExpense, updateExpenseStatus } from '../controllers/expense.controller.js';
import {mockAuth} from "../middlewares/mockAuth.middleware.js";

const router = express.Router();

router.use(mockAuth)

router.post("/expenses",addExpense);
router.get("/expenses",getUserExpenses)
router.get("/expenses/:expense_id",getExpenseById)
router.delete("/expenses/:expense_id",deleteExpense)
router.patch("/expenses/:expense_id/status",updateExpenseStatus)
router.put("/expenses/:expense_id",updateExpense)

export default router;