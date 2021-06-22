FROM node:12

WORKDIR /app

RUN mkdir -p /run/secrets
COPY private-key.pem /run/secrets/private-key
COPY ["package.json", "package-lock.json*", "index.js", "handlePR.js", "./"]

RUN npm install

EXPOSE 3000

CMD npm start



