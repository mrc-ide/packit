FROM node:22

ARG PUBLIC_URL=
ENV PUBLIC_URL=$PUBLIC_URL

ARG REACT_APP_PACKIT_URL=
ENV REACT_APP_PACKIT_URL=$REACT_APP_PACKIT_URL

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
WORKDIR /app
RUN npm ci

COPY . /app

RUN npm run build

FROM nginx:stable

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=0 /app/build /usr/share/nginx/html
