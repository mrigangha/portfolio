import type { Request } from "../chvm/ts/praline/request.ts"
import type { Response } from "../chvm/ts/praline/response.ts"
import { newApp, route, staticDir, afterRequest, onError } from "../chvm/ts/praline/app.ts"
import { securityHeaders, status } from "../chvm/ts/praline/response.ts"
import { healthCheck } from "../chvm/ts/praline/health.ts"
import { serverConfig } from "../chvm/ts/praline/server.ts"
import { runConcurrent, concurrentConfig } from "../chvm/ts/praline/concurrent.ts"
import type { Templates } from "../chvm/ts/praline/template.ts"
import { newTemplates, loadTemplate, render } from "../chvm/ts/praline/template.ts"
import { newContext, setVar, setList } from "../chvm/ts/praline/context.ts"
import type { Context } from "../chvm/ts/praline/context.ts"

const SITE = "Mrigangha"
const TAGLINE = "I build programming languages, virtual machines and the web servers that run on them."

const templates: Templates = newTemplates("templates")

function project(name: string, text: string, tag: string): Context {
  const c = newContext()
  setVar(c, "name", name)
  setVar(c, "text", text)
  setVar(c, "tag", tag)
  return c
}

function page(): Context {
  const ctx = newContext()
  setVar(ctx, "site", SITE)
  setVar(ctx, "tagline", TAGLINE)
  return ctx
}

function home(req: Request): Response {
  const ctx = page()
  setList(ctx, "projects", [
    project("chvm", "A register virtual machine in C with an assembler, a verifier, lightweight actors and a network layer.", "C"),
    project("chts", "A compiler for a subset of TypeScript, written in itself. It builds to chvm bytecode.", "TypeScript"),
    project("Praline", "A Flask-like web framework with routing, templates and one process per connection. This site runs on it.", "TypeScript")
  ])
  return render(templates, "home.html", ctx)
}

function errorPage(req: Request, code: number): Response {
  const ctx = page()
  setVar(ctx, "code", "" + code)
  setVar(ctx, "message", code === 404 ? "Page not found" : "Something went wrong")
  return status(render(templates, "error.html", ctx), code)
}

function main(): void {
  loadTemplate(templates, "home.html")
  loadTemplate(templates, "error.html")
  const app = newApp()
  route(app, "GET", "/", home)
  healthCheck(app, "/healthz")
  staticDir(app, "/static", "public")
  onError(app, 404, errorPage)
  onError(app, 500, errorPage)
  afterRequest(app, securityHeaders)
  runConcurrent(app, concurrentConfig(serverConfig()))
}
main()
