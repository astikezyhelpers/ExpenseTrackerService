import express from 'express';
import { deleteReceipt, getReceipt, uploadReceipt } from '../controllers/receipt.controller.js';
import { uploadFile } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.post('/:expense_id/receipts', uploadFile('receipts'), uploadReceipt);
router.get('/:expense_id/receipts', getReceipt);
router.delete('/:expense_id/receipts', deleteReceipt);

export default router;
