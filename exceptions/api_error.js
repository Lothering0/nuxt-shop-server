module.exports = class ApiError extends Error {
  status

  constructor(status, message) {
    super(message)

    this.status = status
  }

  static unauthorizedError() {
    return new ApiError(401, 'Unauthorized')
  }

  static badRequest(message) {
    return new ApiError(400, message)
  }

  static notFound(message) {
    return new ApiError(404, message)
  }
}
