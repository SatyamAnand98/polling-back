import express from "express";
import { Poll } from "../Controllers/poll";

const router = express.Router();

router.post("/create/poll", Poll.createPoll);
router.post("/map/user", Poll.handleUser);

export default router;
