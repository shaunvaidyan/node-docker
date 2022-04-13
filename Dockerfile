FROM node:15
WORKDIR /app
COPY package*.json ./
ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ]; \
        then npm install; \
        else npm install --only=production; \
        fi

# optimization 
COPY . ./ 
# optimization
ENV PORT 3000
EXPOSE $PORT
# command executes at runtime
CMD ["npm", "start"]