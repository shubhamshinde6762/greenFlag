import { Request, Response } from "express";

export const test = (req: Request, res: Response): void => {
  try {
    console.log(req)

    res.status(200).json({ message: "Request received successfully!" });
  } catch (error) {
    console.error("Error in test controller:", error);
    res
      .status(500)
      .json({ message: "An error occurred while processing your request." });
  }
};
