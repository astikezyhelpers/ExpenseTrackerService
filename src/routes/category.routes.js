import express from 'express';
import { addExpenseCategory, deleteExpenseCategory, getExpenseCategory } from '../controllers/category.controller.js';

const router = express.Router();

router.post("/categories", addExpenseCategory);
router.get("/categories/:company_id", getExpenseCategory);
router.delete("/categories/:category_id", deleteExpenseCategory);
// router.get('/:expense_id/receipts', getReceipt);
// router.delete('/:expense_id/receipts', deleteReceipt);

export default router;
