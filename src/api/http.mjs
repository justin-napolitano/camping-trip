export function success(status, body) {
  return { status, body };
}

export function failure(status, errorCode, message, details, requestId = "req-local") {
  return {
    status,
    body: {
      error_code: errorCode,
      message,
      details,
      request_id: requestId
    }
  };
}
