import { validationResult } from 'express-validator';

export const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    return next({ errors: errors.array(), errorType: 'Bad Request', errorCode: 400 });
  };
};
