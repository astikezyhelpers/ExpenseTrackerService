import Joi from 'joi';

const createCategorySchema = Joi.object({
    name: Joi.string().min(3).max(30).required()
        .messages({
            'string.base': 'Name must be a string',
            'string.empty': 'Title cannot be empty',
            'string.min': 'Title must be at least 3 characters long',
            'string.max': 'Title must be at most 255 characters long',
            'any.required': 'Title is required'
        }),

    description: Joi.string().max(100).allow('')
        .messages({
            'string.max': 'Description must be at most 100 characters',
        }),

    spend_limit: Joi.number().positive().precision(2).required()
        .messages({
            'number.base': 'Spend limit must be a number',
            'number.positive': 'spend limit must be positive',
            'number.precision': 'spend limit can have at most 2 decimal places',
            'any.required': 'spend limit is required'
        }),

})

export {createCategorySchema}