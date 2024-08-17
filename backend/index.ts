import express, { Request, Response } from 'express';
import testRoute from './routes/testRoutes';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.use("/api/v1", testRoute)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});