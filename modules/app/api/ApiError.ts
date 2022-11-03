import { API_ERROR_CODES } from '../constants/apiErrors';

export class ApiError extends Error {
  code: string;
  status: number;
  clientMessage: string;

  constructor(m: string, status = 500, clientMessage = 'Unexpected Error') {
    super(m);
    this.status = status;
    this.code =
      status === 400
        ? API_ERROR_CODES.INVALID_REQUEST
        : status === 404
        ? API_ERROR_CODES.NOT_FOUND
        : status === 401
        ? API_ERROR_CODES.UNAUTHORIZED
        : status === 403
        ? API_ERROR_CODES.FORBIDDEN
        : API_ERROR_CODES.UNEXPECTED_ERROR;
    this.clientMessage = clientMessage;
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  isApiError() {
    return true;
  }
}
