import { asyncHandler } from "../utils/AsyncHandler.js";
import { InvalidExpenseDataException } from "../utils/exception/InvalidExpenseDataException.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { expenseSchema } from "../validators/createExpenseSchema.js"
import prisma from "../lib/prisma.js"
import { BaseException } from "../utils/exception/BaseException.js";
import { updateExpenseSchema } from "../validators/updateExpense.validator.js";

function mapJoiCodeToCustomCode(joiType) {
    const map = {
        'number.base': 'INVALID_AMOUNT_TYPE',
        'number.positive': 'INVALID_AMOUNT',
        'any.required': 'MISSING_FIELD',
        'date.base': 'INVALID_DATE',
        'date.max': 'FUTURE_DATE',
        'date.min': 'TOO_OLD_DATE',
    };

    return map[joiType] || 'VALIDATION_ERROR';
}

const addExpense = asyncHandler(async (req, res) => {
    const { error, value } = expenseSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errors = error.details.map(err => ({
            field: err.context.key,
            code: mapJoiCodeToCustomCode(err.type),
            message: err.message,
            value: err.context.value,
        }));

        throw new InvalidExpenseDataException(errors);
    }

    try {
        const newExpense = await prisma.expense.create({
            data: {
                ...value,
                user_id: '1',
                company_id: '1',
                category_id: 'cat-1',
                subcategory_id: 'sub-2',
                merchant: "Apna",
                project_id: '1',
            }
        })
        return res
            .status(201)
            .json(new ApiResponse(201, newExpense, "Expense added successfully"));

    } catch (error) {
        console.log(error.message);
        throw new BaseException(
            400,
            "Something went wrong while adding expense",
            "ADD_EXPENSE_FAILED",
            [
                {
                    reason: error.message || "Unknown reason",
                    code: error.code || "Unknown code"
                }
            ]
        )
    }
})

const getUserExpenses = asyncHandler(async (req, res) => {
    const { user_id } = req.query;

    if (!user_id) {
        throw new BaseException(
            400,
            "User ID is required",
            "USER_ID_MISSING",
            [{ field: "user_id", reason: "User ID parameter is missing" }]
        );
    }

    try {
        const expenses = await prisma.expense.findMany({
            where: { user_id }
        });

        if (expenses.length === 0) {
            throw new BaseException(
                404,
                "No expenses found for this user",
                "EXPENSES_NOT_FOUND",
                [{ user_id }]
            );
        }

        return res.status(200).json(new ApiResponse(200, expenses))

    } catch (error) {
        if (error instanceof BaseException) {
            throw error;
        }

        throw new BaseException(
            500,
            "Failed to retrieve expenses",
            "GET_EXPENSES_ERROR",
            [{ reason: error.message }]
        );
    }
});

const getExpenseById = asyncHandler(async (req, res) => {
    const { expense_id } = req.params;

    try {
        const expense = await prisma.expense.findUnique({
            where: { expense_id },
        });

        console.log(expense);

        if (!expense) {
            throw new BaseException(404, "Expense not found", "EXPENSE_NOT_FOUND", [
                { field: "expense_id", reason: "No matching expense found" },
            ]);
        }

        return res.status(200).json(new ApiResponse(200, expense))

    } catch (error) {
        if (error instanceof BaseException) {
            throw error;
        }

        throw new BaseException(500, "Failed to retrieve expense", "GET_EXPENSE_FAILED", [
            { reason: error.message },
        ]);
    }
});

const deleteExpense = asyncHandler(async (req, res) => {
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

        await prisma.expense.delete({
            where: { expense_id }
        })

        return res.status(200).json(new ApiResponse(200, { "expense_id": expense_id }, "Expense deleted successfully"))


    } catch (error) {
        if (error instanceof BaseException) {
            throw error;
        }

        throw new BaseException(
            500,
            "Failed to delete expense",
            "DELETE_EXPENSE_FAILED",
            [{ reason: error.message }]
        );
    }
})

const updateExpenseStatus = asyncHandler(async (req, res) => {
    const { expense_id } = req.params;
    const { status } = req.body;

    const validStatus = ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "REIMBURSED", "CANCELED"]

    if (!validStatus.includes(status)) {
        throw new BaseException(
            400,
            "Invalid status value",
            "INVALID_EXPENSE_STATUS",
            [{ field: "status", reason: `Allowed values: ${validStatus.join(", ")}` }]
        );
    }

    try {
        const existingExpense = await prisma.expense.findUnique({
            where: { expense_id }
        })

        if (!existingExpense) {
            throw new BaseException(
                404,
                "Expense not found",
                "EXPENSE_NOT_FOUND",
                [{ field: "expense_id", reason: "No matching expense found" }]
            );
        }

        const updatedExpense = await prisma.expense.update({
            where: { expense_id },
            data: { status },
        });

        return res.status(200).json(new ApiResponse(200, updatedExpense, "Expense status updated successfully"));

    } catch (error) {
        if (error instanceof BaseException) throw error;

        throw new BaseException(
            500,
            "Failed to update expense status",
            "UPDATE_EXPENSE_STATUS_FAILED",
            [{ reason: error.message }]
        );
    }
})

const updateExpense = asyncHandler(async (req, res) => {
    const { expense_id } = req.params;

    const { error, value } = updateExpenseSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errors = error.details.map(err => ({
            field: err.context.key,
            code: mapJoiCodeToCustomCode(err.type),
            message: err.message,
            value: err.context.value,
        }));

        throw new InvalidExpenseDataException(errors);
    }

    try {
        const existingExpense = await prisma.expense.findUnique({
            where: { expense_id },
        })

        if (!existingExpense) {
            throw new BaseException(404, "Expense not found", "EXPENSE_NOT_FOUND", [
                { field: "expense_id", reason: "No expense with given ID" },
            ]);
        }

        const updatedExpense = await prisma.expense.update({
            where: { expense_id },
            data: {
                ...value,
                updated_at: new Date(),
            },
        });

        return res.status(200).json(new ApiResponse(200, updatedExpense, "Expense updated successfully"))
    } catch (error) {
        if (error instanceof BaseException) throw error;        

        throw new BaseException(500, "Failed to update expense", "EXPENSE_UPDATE_FAILED", [
            { reason: error.message },
        ]);
    }
})

export { addExpense, getUserExpenses, getExpenseById, deleteExpense, updateExpenseStatus, updateExpense };