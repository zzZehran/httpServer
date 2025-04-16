import { initialize } from "./index.js";

const app = initialize();

app.use("/use", (req, res, next) => {
  console.log("USE");
  next();
  res.end("From .use /");
});
app.post("/use/:id", (req, res) => {
  console.log("/use/zehran");
});

// app.get("/", (req, res) => {
//   console.log("/");
//   res.end("From /");
// });

// routes for next()
// app.get("/next/*spat", (req, res, next) => {
//   console.log("0");
//   next();
//   console.log("1");
//   res.end("Next() is working!");
// });
// app.get("/next/user", (req, res, next) => {
//   console.log("2");
//   next();
//   console.log("3");
// });
// app.get("/next/user", (req, res) => {
//   console.log("4");
// });

//post routes
// app.post("/post", async (req, res) => {
//   console.log("POST req.");
//   let body = [];
//   req
//     .on("data", (chunk) => {
//       body.push(chunk);
//     })
//     .on("end", () => {
//       body = Buffer.concat(body).toString();
//       // at this point, `body` has the entire request body stored in it as a string
//       console.log(body);
//     });

//   res.end("<h1>/POST route</h1>");
// });

const port = 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
