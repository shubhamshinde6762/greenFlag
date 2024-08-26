import express, { Request, Response } from 'express';
import testRoute from './routes/testRoutes';
import connectDb from './db/connect';
import routes from './routes/index'

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());


connectDb();

app.use('/', routes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.use("/api/v1", testRoute)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});