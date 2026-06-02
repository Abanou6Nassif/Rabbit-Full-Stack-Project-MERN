const catchError = (fn) => {
  return (req, res, next) => {
    try {
      return Promise.resolve(fn(req, res, next)).catch(next);
    } catch (error) {
      return next(error);
    }
  };
};

export default catchError;
