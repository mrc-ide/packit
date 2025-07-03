FROM node:22

ARG PUBLIC_URL=
ENV PUBLIC_URL=$PUBLIC_URL

ARG VITE_PACKIT_API_URL=

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
WORKDIR /app
RUN npm ci

COPY . /app

# override env var in production file if set
RUN if [ -n "$VITE_PACKIT_API_URL" ]; then  echo "VITE_PACKIT_API_URL=$VITE_PACKIT_API_URL" >> env.production.local;  fi

RUN if [ -n "$PUBLIC_URL" ]; then npm run build -- --base=$PUBLIC_URL; else npm run build; fi

FROM nginx:stable

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=0 /app/build /usr/share/nginx/html
