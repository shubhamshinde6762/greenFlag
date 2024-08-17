const express = require("express");
const cors = require("cors");
const expressFileUploader = require("express-fileupload");

require("dotenv").config();
const app = express();
app.use(express.json());
app.use(
  expressFileUploader({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use(cors());

app.get("/", (req, res) => {
  res.send("welcome to api");
});

app.listen(4000, () => console.log("node listening"));
