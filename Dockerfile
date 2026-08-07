FROM node:24-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma
COPY backend ./backend
COPY app ./app
COPY src ./src
COPY public ./public
COPY tsconfig.json next.config.ts postcss.config.mjs ./

RUN npm ci
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
