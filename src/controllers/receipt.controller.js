import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { BaseException } from "../utils/exception/BaseException.js";
import { InvalidReceiptException } from "../utils/exception/InvalidReceiptException.js";


const uploadReceipt = asyncHandler(async (req, res) => {

  if (!req.file) {
    throw new BaseException(
      400,
      "No file found",
      "ADD_RECEIPT_FAILED"
    )
  }

  const fileSizeInMb = req.file.size / 1024 / 1024;

  if (fileSizeInMb > 10) {
    const error = [{
      field: "file",
      message: "File size exceeds the maximum limit of 10MB"
    }]
    throw new InvalidReceiptException(error)
  }

  const { expense_id } = req.params;

  try {
    const expense = await prisma.expense.findUnique({
      where: { expense_id }
    });

    if (!expense) {
      throw new BaseException(
        404,
        "Expense not found",
        "EXPENSE_NOT_FOUND",
        [{ field: "expense_id", reason: "No matching expense found" }]
      );
    }

    const newReceipt = await prisma.receipt.create({
      data: {
        expense_id,
        file_name: req.file.filename,
        file_path: req.file.path,
        file_url: req.file.path,
        file_type: req.file.mimetype,
      }
    })

    return res
      .status(201)
      .json(new ApiResponse(201, newReceipt, "Receipt added successfully"))

  } catch (error) {
    console.log(error.message);

    if (error instanceof BaseException) {
      throw error;
    }

    throw new BaseException(
      400,
      "Something went wrong while adding receipt",
      "ADD_RECEIPT_FAILED",
      [{ reason: error.message }]
    );
  }
})

const getReceipt = asyncHandler(async (req, res) => {
  const { expense_id } = req.params;

  if (!expense_id) {
    throw new BaseException(
      400,
      "Expense ID is required",
      "EXPENSE_ID_MISSING",
      [{ field: "expense_id", reason: "Expense ID parameter is missing" }]
    );
  }
  const receipt = await prisma.receipt.findMany({
    where: { expense_id }
  });

  if (receipt.length == 0) {
    throw new BaseException(
      404,
      "receipt not found",
      "RECEIPT_NOT_FOUND",
      [{ field: "expense_id", reason: "No matching receipt found" }]
    );
  }
  return res.status(200).json(new ApiResponse(200, receipt))
})

const deleteReceipt = asyncHandler(async (req, res) => {
  const { expense_id } = req.params;

  if (!expense_id) {
    throw new BaseException(
      400,
      "Expense ID is required",
      "EXPENSE_ID_MISSING",
      [{ field: "expense_id", reason: "Expense ID parameter is missing" }]
    );
  }

  const receipts = await prisma.receipt.findMany({
    where: { expense_id },
  });

  if (receipts.length === 0) {
    throw new BaseException(
      404,
      "Receipt not found",
      "RECEIPT_NOT_FOUND",
      [{ field: "expense_id", reason: "No matching receipt found" }]
    );
  }

  // Delete all receipts for this expense
  await prisma.receipt.deleteMany({
    where: { expense_id },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Receipts deleted successfully"));
});


export { uploadReceipt, getReceipt, deleteReceipt };