FROM node:12.16.3

EXPOSE 3000

WORKDIR /app

COPY . .

RUN yarn --no-progress --non-interactive --frozen-lockfile

CMD [ "yarn", "dev" ]