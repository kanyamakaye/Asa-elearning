# ---- Build the static bundle ----
FROM node:22-alpine AS build
WORKDIR /app

# Installed from the lockfile in its own layer so `npm ci` is only re-run
# when dependencies actually change, not on every source edit.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* variables into the bundle at build time, so the API
# origin has to be supplied as a build arg rather than a runtime env var.
ARG VITE_API_URL=http://localhost:8000/api/v1
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build

# ---- Serve it ----
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
