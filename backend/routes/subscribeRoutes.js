import express from "express";
import { subscribe } from "../controllers/subscribe/subscribeController.js";

const router = express.Router()

//@route POST /api/subscribe
//@desc handle newsletter subscribtion
//@access Public
router.post("/", subscribe);

export default router