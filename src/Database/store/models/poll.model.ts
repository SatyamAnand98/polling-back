import mongoose from "mongoose";
import { pollOptionsSchema, pollSchema } from "../schemas/poll.schema";

const pollModel = mongoose.model("Poll", pollSchema);
const pollOptionsModel = mongoose.model("PollOptions", pollOptionsSchema);

export { pollModel, pollOptionsModel };
