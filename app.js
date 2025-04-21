import { initialize } from "./index.js";

const app = initialize();

function isLoggedin(req, res, next) {
  console.log("YES LOGGED IN!");
  return next();
}

app.get("/", isLoggedin, (req, res) => {
  console.log("/");
  res.end("Hello from /");
});

app.use(
  (req, res, next) => {
    console.log("middleware");
    next();
  },
  (req, res) => {
    console.log("post /");
    res.end("POSTED");
  }
);

const port = 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
