import {validationResult} from 'express-validator';
import jwtDecode from 'jwt-decode';

const error = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  } else {
    next();
  }
};

const decodeAuthToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    const decoded = jwtDecode(token.substring(6, token.length));
    req.headers.authorization = decoded;
  }
  next();
};

export {error, decodeAuthToken};
