import http from "node:http";
import mergeDescriptors from "merge-descriptors";
import url from "node:url";
import { match } from "path-to-regexp";

export function initialize() {
  const routes = [];

  const lib = {
    get: (path, handlerFn) => {
      routes.push({ path, handlerFn, method: "GET" });
    },
    post: (path, handlerFn) => {
      routes.push({ path, handlerFn, method: "POST" });
    },
  };

  function matchRoutes(urlPathname, urlMethod) {
    return routes.filter((route) => {
      const matchFn = match(route.path);
      const isMatch = matchFn(urlPathname);
      return isMatch && urlMethod === route.method;
    });
  }

  const server = http.createServer((req, res) => {
    const method = req.method;
    const path = url.parse(req.url).pathname;

    // console.log(method, path);

    const matchedRoutes = matchRoutes(path, method);;
      let i = 0;
      let handlerFn;
      function next() {
        handlerFn = matchedRoutes[i]?.handlerFn;
        i += 1;
        typeof handlerFn === "function" && handlerFn(req, res, next);
      }
      next();
  });

  return mergeDescriptors(server, lib);
}
