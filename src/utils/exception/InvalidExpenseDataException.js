import { ValidationException } from './ValidationException.js';

class InvalidExpenseDataException extends ValidationException {
  constructor(details = []) {
    super("Invalid expense data provided", "INVALID_EXPENSE_DATA", details);
  }
}

export { InvalidExpenseDataException };
