import { Request, Response } from "express";
import userBehavior from "../models/behavior";

export const test = async (req: Request, res: Response) => {
  try {
    console.log(req.body.userBehaviorData);

    await userBehavior.create(req.body.userBehaviorData);

    res.status(200).json({ message: "Request received successfully!" });
  } catch (error) {
    console.error("Error in test controller:", error);
    res
      .status(500)
      .json({ message: "An error occurred while processing your request." });
  }
};
