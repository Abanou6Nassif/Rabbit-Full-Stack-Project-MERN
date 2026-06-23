import AppError from "../../utils/appError.js";
import catchError from "../../utils/catchError.js";
import subscriberModel from "../../models/subscriber/Subscriber.js";

export const subscribe = catchError(async (req, res) => {
  const { email } = req.body ?? {};

  if (!email) throw new AppError("Email is required", 400);

  //Check if the email is already subscribed
  let subscriber = await subscriberModel.findOne({ email });
  if (subscriber) throw new AppError("Email is already subscribed", 400);

  subscriber = await subscriberModel.create({ email });
  res
    .status(201)
    .json({ message: "Successfully subscribed to the newsletter!" });
});
