import {validationResult} from 'express-validator';

const error = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  } else {
    next();
  }
};

export {error};
