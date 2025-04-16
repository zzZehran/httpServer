import http from "node:http";
import mergeDescriptors from "merge-descriptors";
import url from "node:url";
import path from "path/posix";
import { match } from "path-to-regexp";

const USE_METHOD_STRING = "__USE";

export function initialize() {
  const routes = [];

  const lib = {
    get: (path, handlerFn) => {
      routes.push({ path, handlerFn, method: "GET" });
    },
    post: (path, handlerFn) => {
      routes.push({ path, handlerFn, method: "POST" });
    },
    use: (pathOrHandler, handlerFn) => {
      if (typeof pathOrHandler === "function") {
        routes.push({
          path: "*spat",
          handlerFn: pathOrHandler,
          method: USE_METHOD_STRING,
        });
      } else if (
        typeof pathOrHandler === "string" &&
        typeof handlerFn === "function"
      ) {
        pathOrHandler =
          pathOrHandler[pathOrHandler.length - 1] === "/"
            ? pathOrHandler.slice(0, pathOrHandler.length - 1)
            : pathOrHandler;
        routes.push({
          path: pathOrHandler + "{/*spat}",
          handlerFn,
          method: USE_METHOD_STRING,
        });
      }
    },
  };

  function matchRoutes(urlPathname, urlMethod) {
    return routes
      .filter((route) => {
        const matchFn = match(route.path);
        const isMatch = matchFn(urlPathname);
        return (
          isMatch &&
          (urlMethod === route.method || route.method === USE_METHOD_STRING)
        );
      })
      .map((route) => {
        //read again
        const matchFn = match(route.path);
        const isMatch = matchFn(urlPathname);
        return { route, params: isMatch.params };
      });
  }

  const server = http.createServer((req, res) => {
    const method = req.method;
    const path = url.parse(req.url).pathname;
    // console.log(method, path);

    const matchedRoutes = matchRoutes(path, method);
    console.log("Matched routes:", matchedRoutes);
    let i = 0;
    let handlerFn;
    function next() {
      handlerFn = matchedRoutes[i]?.route?.handlerFn;
      i += 1;
      req.params = matchedRoutes[i]?.params;
      typeof handlerFn === "function" && handlerFn(req, res, next);
    }
    next();
  });

  return mergeDescriptors(server, lib);
}
