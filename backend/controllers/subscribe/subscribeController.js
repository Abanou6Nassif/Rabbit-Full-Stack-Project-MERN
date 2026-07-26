import AppError from "../../utils/appError.js";
import catchError from "../../utils/catchError.js";
import subscriberModel from "../../models/subscriber/Subscriber.js";
import { subscribeValidationSchema } from "../../models/subscriber/subscriberValidationSchema.js";

export const subscribe = catchError(async (req, res) => {
  const { error, value } = subscribeValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  const { email } = value;

  //Check if the email is already subscribed
  let subscriber = await subscriberModel.findOne({ email });
  if (subscriber) throw new AppError("Email is already subscribed", 400);

  subscriber = await subscriberModel.create({ email });
  res
    .status(201)
    .json({ message: "Successfully subscribed to the newsletter!" });
});
