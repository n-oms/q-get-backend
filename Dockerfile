FROM node:latest As build

WORKDIR /q-get-backend

COPY package*.json yarn.lock ./

RUN yarn install --frozen-lockfile --production

COPY . .

RUN yarn global add typescript

RUN yarn add --dev @types/node

RUN yarn build

FROM node:slim

COPY --from=build /q-get-backend/bin ./bin
COPY --from=build /q-get-backend/node_modules ./node_modules
COPY --from=build /q-get-backend/package.json ./

# Install pm2
RUN npm install pm2 -g --no-progress


# Expose port 8000
EXPOSE 8000

# Command to run the application
CMD ["pm2-runtime", "bin/app.js"]
