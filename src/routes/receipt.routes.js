import express from 'express';
import { uploadReceipt } from '../controllers/receipt.controller.js';
import { uploadFile } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.post('/upload-receipt', uploadFile('receipts'), uploadReceipt);

export default router;
