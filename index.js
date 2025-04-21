import http from "node:http";
import mergeDescriptors from "merge-descriptors";
import url from "node:url";
import { match } from "path-to-regexp";

const USE_METHOD_STRING = "__USE";

export function initialize() {
  const routes = [];

  const lib = {
    get: (path, ...handlerFn) => {
      for (let handler of handlerFn) {
        routes.push({ path, handler, method: "GET" });
      }
    },
    post: (path, ...handlerFn) => {
      for (let handler of handlerFn) {
        routes.push({ path, handler, method: "POST" });
      }
    },
    //read again
    use: (pathOrHandler, ...handlerFn) => {
      if (typeof pathOrHandler === "function") {
        routes.push({
          path: "*splat",
          handler: pathOrHandler,
          method: USE_METHOD_STRING,
        });
        for (let handler of handlerFn) {
          routes.push({
            path: "*splat",
            handler,
            method: USE_METHOD_STRING,
          });
        }
      } else if (
        typeof pathOrHandler === "string" &&
        typeof Array.isArray(handlerFn)
      ) {
        pathOrHandler =
          pathOrHandler[pathOrHandler.length - 1] === "/"
            ? pathOrHandler.slice(0, pathOrHandler.length - 1)
            : pathOrHandler;
        for (let handler of handlerFn) {
          routes.push({
            path: pathOrHandler + "{/*splat}",
            handler,
            method: USE_METHOD_STRING,
          });
        }
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
    req.path = path;
    req.baseUrl = "";

    const matchedRoutes = matchRoutes(path, method);
    let i = 0;
    let handlerFn;
    function next() {
      handlerFn = matchedRoutes[i]?.route?.handler;
      req.params = matchedRoutes[i]?.params;
      i += 1;
      typeof handlerFn === "function" && handlerFn(req, res, next);
    }
    next();
  });

  return mergeDescriptors(server, lib);
}
