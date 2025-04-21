import { initialize } from "./index.js";

const app = initialize();

// function isLoggedin(req, res, next) {
//   console.log("YES LOGGED IN!");
//   return next();
// }

// app.get("/", (req, res) => {
//   console.log("/");
//   res.end("Hello from /");
// });

// app.use(
//   (req, res, next) => {
//     console.log("middleware");
//     next();
//   },
//   (req, res) => {
//     console.log("post /");
//     res.end("POSTED");
//   }
// );

app.get("/user", (req, res, next) => {
  console.log("From /user");
  next("Error");
});

app.use((err, req, res, next) => {
  console.log("IN ERROR HANDLER");
  res.end("ERROR HANDLER");
});

const port = 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
