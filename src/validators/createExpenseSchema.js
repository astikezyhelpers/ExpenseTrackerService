import Joi from 'joi';

// Get date range
const today = new Date();
const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(today.getMonth() - 6);

// Regex to disallow special characters
const noSpecialCharsRegex = /^[a-zA-Z0-9 ]+$/;


// Joi schema
const expenseSchema = Joi.object({

    title: Joi.string().min(3).max(255).pattern(noSpecialCharsRegex).required()
        .messages({
            'string.base': 'Title must be a string',
            'string.empty': 'Title cannot be empty',
            'string.min': 'Title must be at least 3 characters long',
            'string.max': 'Title must be at most 255 characters long',
            'string.pattern.base': 'Title must not contain special characters',
            'any.required': 'Title is required'
        }),

    amount: Joi.number().positive().precision(2).required()
        .messages({
            'number.base': 'Amount must be a number',
            'number.positive': 'Amount must be positive',
            'number.precision': 'Amount can have at most 2 decimal places',
            'any.required': 'Amount is required'
        }),

    category_id: Joi.string().required()
        .messages({
            'string.base': 'Currency must be a string',
            'any.required': 'category_id is required'
        }),

    currency: Joi.string().length(3).uppercase().required()
        .messages({
            'string.base': 'Currency must be a string',
            'string.length': 'Currency must be a valid 3-letter ISO 4217 code',
            'string.uppercase': 'Currency code must be uppercase',
            'any.required': 'Currency is required',
        }),

    expense_date: Joi.date().min(sixMonthsAgo).max(today).required()
        .messages({
            'date.base': 'Date must be a valid date',
            'date.min': 'Date cannot be older than 6 months',
            'date.max': 'Date cannot be in the future',
            'any.required': 'Date is required'
        }),

    description: Joi.string()
        .max(1000)
        .allow('')
        .messages({
            'string.max': 'Description must be at most 1000 characters',
        }),

    merchant: Joi.string()
        .max(255)
        .allow('')
        .messages({
            'string.max': 'Merchant must be at most 255 characters',
        }),

    tags: Joi.array()
        .items(Joi.string().max(50))
        .max(10)
        .messages({
            'array.base': 'Tags must be an array of strings',
            'array.max': 'You can assign up to 10 tags',
            'string.max': 'Each tag must be at most 50 characters long',
        }),

    attendees: Joi.array()
        .items(Joi.string().max(50))
        .max(10)
        .messages({
            'array.base': 'Tags must be an array of strings',
            'array.max': 'You can assign up to 10 attendees',
            'string.max': 'Each attendees must be at most 50 characters long',
        }),
});


export { expenseSchema }