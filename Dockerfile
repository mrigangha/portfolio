# Builds the site with chvm and chts, then ships one static executable and the site's files.
# The final image has no shell, no node and no libraries.
#
# The chvm source is a stage of its own. By default it is cloned from GitHub at CHVM_REF. To build against a
# local checkout instead: docker build --build-context chvm=../chvm .
FROM alpine/git AS chvm-git
ARG CHVM_REPO=https://github.com/mrigangha/chvm
ARG CHVM_REF=main
RUN git clone --depth 1 --branch "$CHVM_REF" "$CHVM_REPO" /chvm \
 && rm -rf /chvm/.git

FROM scratch AS chvm
COPY --from=chvm-git /chvm /

FROM node:24-bookworm AS build
COPY --from=chvm / /src/chvm
COPY main.ts /src/portfolio/main.ts
WORKDIR /src/chvm
# no libffi: foreign calls are not needed, and a static binary cannot load libraries
RUN make FFI=0 build/chasm build/chbake
RUN node ts/src/chts.ts -o /tmp/site.chbc /src/portfolio/main.ts
RUN build/chbake --net /tmp/site.chbc /tmp/site.c \
 && cc -O2 -std=gnu11 -fno-crossjumping --param max-goto-duplication-insns=32 -Isrc -static \
       -o /tmp/site /tmp/site.c src/chbc.c src/sys.c src/foreign.c -lm \
 && strip /tmp/site

FROM scratch
WORKDIR /app
COPY --from=build /tmp/site /app/site
COPY public /app/public
COPY templates /app/templates
USER 10001:10001
# Render sets PORT. The server listens on 0.0.0.0 when PORT is set.
ENV PORT=10000
EXPOSE 10000
STOPSIGNAL SIGTERM
ENTRYPOINT ["/app/site"]
