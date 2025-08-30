import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { BaseException } from "../utils/exception/BaseException.js";
import { InvalidCategoryDataException } from "../utils/exception/InvalidCategoryDataException.js";
import { createCategorySchema } from "../validators/createCategorySchema.js";

function mapJoiCodeToCustomCode(joiType) {
    const map = {
        'number.base': 'INVALID_AMOUNT_TYPE',
        'number.positive': 'INVALID_AMOUNT',
        'any.required': 'MISSING_FIELD',
    };

    return map[joiType] || 'VALIDATION_ERROR';
}

const addExpenseCategory = asyncHandler(async (req, res) => {

    // const { company_id } = req.user?.company_id || 'c1';

    const company_id = 'c1'

    if (!company_id) {
        throw new BaseException(
            401,
            "Unauthorized access",
            "UNAUTHORIZED",
            [{ field: "company_id", reason: "User does not belong to a valid company" }]
        );
    }

    const { error, value } = createCategorySchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errors = error.details.map(err => ({
            field: err.context.key,
            code: mapJoiCodeToCustomCode(err.type),
            message: err.message,
            value: err.context.value,
        }));

        throw new InvalidCategoryDataException(errors);
    }

    try {
        const newCategory = await prisma.ExpenseCategory.create({
            data: {
                ...value,
                company_id
            }
        })

        return res
            .status(201)
            .json(new ApiResponse(201, newCategory, "Category added successfully"))

    } catch (error) {
        if (error instanceof BaseException) {
            throw error;
        }

        throw new BaseException(
            400,
            "Something went wrong while adding category",
            "ADD_CATEGORY_FAILED",
            [{
                name: error.name,
                reason: error.message || "Unknown reason",
                code: error.code || "Unknown code"
            }]
        );
    }
})

const getExpenseCategory = asyncHandler(async (req, res) => {
    // const { company_id } = req.user?.company_id
    const {company_id} = req.params;  

    if (!company_id) {
        throw new BaseException(
            401,
            "Unauthorized access",
            "UNAUTHORIZED",
            [{ field: "company_id", reason: "User does not belong to a valid company" }]
        );
    }

    try{
        const categories = await prisma.ExpenseCategory.findMany({
            where:{
                company_id
            }
        })

        if(categories.length === 0){
            throw new BaseException(
                404,
                "No category found for this company",
                [{company_id}]
            )
        }

        return res.status(200).json(new ApiResponse(200, categories))
    }
    catch(error){
        if (error instanceof BaseException) {
            throw error;
        }

        throw new BaseException(
            500,
            "Failed to retrieve categories",
            "GET_CATEGORY_ERROR",
            [{ reason: error.message }]
        );
    }
})

const deleteExpenseCategory = asyncHandler(async (req, res) => {
    const { category_id } = req.params;

    if (!category_id) {
        throw new BaseException(
            400,
            "Category ID is required",
            "MISSING_CATEGORY_ID",
            [{ field: "category_id", reason: "Category ID not provided in request" }]
        );
    }

    try {
        // Optional: Check if the category exists before deleting
        const existingCategory = await prisma.expenseCategory.findUnique({
            where: {
                category_id,
            },
        });

        if (!existingCategory) {
            throw new BaseException(
                404,
                "Category not found",
                "CATEGORY_NOT_FOUND",
                [{ field: "category_id", reason: "No category found with given ID" }]
            );
        }

        await prisma.expenseCategory.delete({
            where: {
                category_id,
            },
        });

        return res.status(200).json(new ApiResponse(200, null, "Category deleted successfully"));
    } catch (error) {

        console.log(error);
        

        if (error instanceof BaseException) {
            throw error;
        }

        throw new BaseException(
            500,
            "Failed to delete category",
            "DELETE_CATEGORY_ERROR",
            [{ reason: error.message }]
        );
    }
});


export { addExpenseCategory, getExpenseCategory, deleteExpenseCategory };