import { BaseException } from './BaseException.js';

class ValidationException extends BaseException {
  constructor(message = "Validation failed", code = "VALIDATION_ERROR", details = []) {
    super(400, message, code, details);
  }
}

export { ValidationException };
