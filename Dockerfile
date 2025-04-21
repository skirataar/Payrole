FROM continuumio/miniconda3:latest

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Create conda environment
COPY environment.yml .
RUN conda env create -f environment.yml

# Make RUN commands use the new environment
SHELL ["/bin/bash", "-c"]

# Copy backend code
COPY backend/ ./backend/

# Copy frontend code
COPY package.json package-lock.json ./
COPY public/ ./public/
COPY src/ ./src/
COPY index.html vite.config.js tailwind.config.js postcss.config.js ./

# Build frontend
RUN npm install
RUN npm run build

# Expose the port
EXPOSE 8000

# Run the application
CMD ["/bin/bash", "-c", "source activate payroll-env && cd backend && python main.py"]
