module.exports = {
  NotFound: {
    message: "Not Found",
    code: "NOT_FOUND",
    httpCode: 404,
  },
  OtpNotMatch: {
    message: "Otp Not Found",
    code: "NOT_FOUND",
    httpCode: 404,
  },
  Internal: {
    message: "Internal Server Error",
    code: "INTERNAL_SERVER_ERROR",
    httpCode: 500,
  },
  Unauthorized: {
    message: "Unauthorized",
    code: "UNAUTHORIZED",
    httpCode: 401,
  },
  BadRequest: {
    message: "Bad Request",
    code: "BAD_REQUEST",
    httpCode: 400,
  },
  Conflict: {
    message: "Already exist",
    code: "CONFLICT",
    httpCode: 409,
  },
  DBError: {
    message: "Something happen wrong. Please try again",
    code: "DB_ERROR",
    httpCode: "500",
  },
  InvalidArguments: {
    message: "Invalid Arguments",
    code: "INVALID_ARGUMENTS",
    httpCode: 400,
  },
  InvalidCredentials: {
    message: "Invalid credentials",
    code: "INVALID_CREDENTIALS",
    httpCode: 401,
  },
  ValidationFailed: {
    message: "Validation Failed",
    code: "VALIDATION_FAILED",
    httpCode: 422,
  },
  MaxFileLimitExceeded: {
    message: "Payload too large",
    code: "PAYLOAD_TOO_LARGE",
    httpCode: 413,
  },
  InvalidFile: {
    message: "Invalid File",
    code: "INVALID_FILE",
    httpCode: 400,
  },
  UploadError: {
    message: "Upload Error",
    code: "UPLOAD_ERROR",
    httpCode: 500,
  },
  InvalidToken: {
    message: "Invalid token",
    code: "INVALID_TOKEN",
    httpCode: 402,
  },
  LinkExpired: {
    message: "Link Expired",
    code: "LINK_EXPIRED",
    httpCode: 401,
  },
};
