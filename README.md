# portfolio

A site built with Praline (a web framework in TypeScript) and run by chvm (a bytecode VM in C). The two live in
https://github.com/mrigangha/chvm. This repo holds only the site.

## Files

- `main.ts`: the routes. Imports Praline from `../chvm/ts/praline/`.
- `public/`: static files, served under `/static`.
- `Dockerfile`: clones chvm, compiles `main.ts`, bakes it into one static executable, and ships only that and `public/`.
  The image is about 1.3 MB and runs as a non-root user.
- `render.yaml`: the Render service. Health check path `/healthz`.

## Build and run

    docker build -t portfolio .                                  # clones chvm from GitHub (CHVM_REF=main)
    docker build --build-context chvm=../chvm -t portfolio .     # or use a local checkout
    docker run -p 8080:10000 portfolio

`docker stop` sends SIGTERM: the server finishes the requests in progress and exits with 0.

## Deploy on Render

1. Push this repo to GitHub. The chvm repo must have the commit with `SYS_STOPPING` and `healthCheck` pushed first.
2. In Render: New, Blueprint, pick this repo. `render.yaml` sets the Docker runtime and the health check.
3. To pin the chvm version, set the `CHVM_REF` build argument to a tag or branch.
