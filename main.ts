import type { Request } from "../chvm/ts/praline/request.ts"
import type { Response } from "../chvm/ts/praline/response.ts"
import { newApp, route, staticDir, afterRequest } from "../chvm/ts/praline/app.ts"
import { html, securityHeaders } from "../chvm/ts/praline/response.ts"
import { healthCheck } from "../chvm/ts/praline/health.ts"
import { serverConfig } from "../chvm/ts/praline/server.ts"
import { runConcurrent, concurrentConfig } from "../chvm/ts/praline/concurrent.ts"
import { htmlEscape } from "../chvm/ts/praline/escape.ts"
import { param } from "../chvm/ts/praline/input.ts"

function home(req: Request): Response {
  return html("<!doctype html><html><head><meta charset=\"utf-8\"><title>Praline</title>" +
    "<link rel=\"stylesheet\" href=\"/static/style.css\"></head><body><h1>Hello from Praline</h1>" +
    "<p>A web framework written in TypeScript, running on a bytecode VM written in C.</p></body></html>")
}

function hello(req: Request): Response {
  return html("<h1>Hello, " + htmlEscape(param(req, "who")) + "</h1>")
}

function main(): void {
  const app = newApp()
  route(app, "GET", "/", home)
  route(app, "GET", "/hello/<who>", hello)
  healthCheck(app, "/healthz")
  staticDir(app, "/static", "public")
  afterRequest(app, securityHeaders)
  const sc = serverConfig()
  runConcurrent(app, concurrentConfig(sc))
}
main()
