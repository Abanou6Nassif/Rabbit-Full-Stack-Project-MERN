export default class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name
    this.statusCode = statusCode;
    if(Error.captureStackTrace){
        Error.captureStackTrace(this,this.constructor)
    }
  }
}
