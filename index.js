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

  function matchRoutes(urlPathname, urlMethod, err) {
    return routes.filter((route) => {
      const matchFn = match(route.path);
      const isMatch = matchFn(urlPathname);
      const isErrPassed = err !== undefined;
      const isErrHandler = route.handler.length >= 4;
      return (
        isMatch &&
        (urlMethod === route.method || route.method === USE_METHOD_STRING) &&
        (isErrPassed ? isErrHandler : true)
      );
    });
    // .map((route) => {
    //   //read again
    //   const matchFn = match(route.path);
    //   const isMatch = matchFn(urlPathname);
    //   return { route, params: isMatch.params };
    // });
  }

  const server = http.createServer((req, res) => {
    // console.log(routes); //passed
    const method = req.method;
    const path = url.parse(req.url).pathname;
    req.path = path;
    req.baseUrl = "";

    let i = 0;
    let matchedRoutes;
    let handlerFn;
    function next(err) {
      if (i === 0) {
        matchedRoutes = matchRoutes(path, method, err);
      }
      // handlerFn = matchedRoutes[i]?.route?.handler; //error
      handlerFn = matchedRoutes[i]?.handler;
      req.params = matchedRoutes[i]?.params;
      i += 1;
      if (handlerFn) {
        err !== undefined
          ? handlerFn(err, req, res, next)
          : handlerFn(req, res, next);
      }
    }
    next();
  });

  return mergeDescriptors(server, lib);
}
