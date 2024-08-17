import express, { Request, Response } from "express";
import { test } from "../controller/test";

const router = express.Router();

router.post("/test", test);

export default router;
