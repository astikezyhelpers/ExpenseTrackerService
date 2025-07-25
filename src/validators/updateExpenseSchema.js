import Joi from 'joi';

// Get date range
const today = new Date();
const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(today.getMonth() - 6);

const noSpecialCharsRegex = /^[a-zA-Z0-9 ]+$/;

const updateExpenseSchema = Joi.object({
  title: Joi.string().min(3).max(255).pattern(noSpecialCharsRegex)
    .messages({
      'string.base': 'Title must be a string',
      'string.empty': 'Title cannot be empty',
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title must be at most 255 characters long',
      'string.pattern.base': 'Title must not contain special characters',
      'any.required': 'Title is required'
    }),

  amount: Joi.number().positive().precision(2)
    .messages({
      'number.base': 'Amount must be a number',
      'number.positive': 'Amount must be positive',
      'number.precision': 'Amount can have at most 2 decimal places',
      'any.required': 'Amount is required'
    }),

  currency: Joi.string().length(3).uppercase()
    .messages({
      'string.base': 'Currency must be a string',
      'string.length': 'Currency must be a valid 3-letter ISO 4217 code',
      'string.uppercase': 'Currency code must be uppercase',
      'any.required': 'Currency is required',
    }),


  description: Joi.string()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Description must be at most 1000 characters',
    }),

  status: Joi.string()
    .valid("DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "REIMBURSED", "CANCELED")
    .messages({
      'any.only': 'Status must be one of: DRAFT, SUBMITTED, APPROVED, REJECTED, REIMBURSED, or CANCELED',
      'string.base': 'Status must be a string',
    }),


  expense_date: Joi.date().min(sixMonthsAgo).max(today)
    .messages({
      'date.base': 'Date must be a valid date',
      'date.min': 'Date cannot be older than 6 months',
      'date.max': 'Date cannot be in the future',
      'any.required': 'Date is required'
    }),
});

export { updateExpenseSchema }