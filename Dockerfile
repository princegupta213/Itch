FROM node:18-alpine as frontend-build
WORKDIR /app

COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install
COPY frontend/ .

# Vite reads VITE_* at build time; if not provided, calls default to same-origin.
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build


FROM python:3.11-slim
WORKDIR /app

COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r /app/requirements.txt

COPY backend/ /app/backend/

# Bundle frontend build into the backend container.
COPY --from=frontend-build /app/frontend/dist /app/backend/static

EXPOSE 8000
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"]
