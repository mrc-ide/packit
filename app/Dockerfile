FROM node:18

COPY package.json /app/package.json
WORKDIR /app
RUN npm install

COPY . /app

RUN npm run build

FROM nginx:stable

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=0 /app/build /usr/share/nginx/html
