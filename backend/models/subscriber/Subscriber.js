import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (email) {
        return /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/.test(email);
      },
      message: (props) => `${props.value} is not a valid email address`,
    },
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Subscriber", subscriberSchema);
