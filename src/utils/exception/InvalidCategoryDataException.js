import { ValidationException } from './ValidationException.js';

class InvalidCategoryDataException extends ValidationException {
  constructor(details = []) {
    super("Invalid category data provided", "INVALID_CATEGORY_DATA", details);
  }
}

export { InvalidCategoryDataException };
