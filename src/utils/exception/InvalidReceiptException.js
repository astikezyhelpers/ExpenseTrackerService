import { ValidationException } from './ValidationException.js';

class InvalidReceiptException extends ValidationException {
  constructor(details = []) {
    super("Invalid receipt provided", "INVALID_RECEIPT", details);
  }
}

export { InvalidReceiptException };
