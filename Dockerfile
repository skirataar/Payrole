FROM node:18-slim AS frontend-builder

WORKDIR /app

# Copy frontend code
COPY package.json package-lock.json ./
COPY public/ ./public/
COPY src/ ./src/
COPY index.html vite.config.js tailwind.config.js postcss.config.js ./

# Build frontend
RUN npm ci
RUN npm run build

# Second stage: Python backend with Conda
FROM continuumio/miniconda3:latest

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create conda environment
COPY environment.yml .
RUN conda env create -f environment.yml

# Make RUN commands use the new environment
SHELL ["/bin/bash", "-c"]

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend from the first stage
COPY --from=frontend-builder /app/dist ./dist

# Copy migration scripts
COPY alembic.ini ./
COPY migrations/ ./migrations/

# Create a non-root user to run the application
RUN groupadd -r payroll && useradd -r -g payroll payroll
RUN chown -R payroll:payroll /app
USER payroll

# Expose the port
EXPOSE 8000

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Run the application with Gunicorn for production
CMD ["/bin/bash", "-c", "source activate payroll-env && cd backend && gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000"]
