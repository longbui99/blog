FROM ubuntu:jammy

# Set working directory
WORKDIR /opt

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3.10-venv \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and env files
COPY ../.env .env.template /opt/
COPY requirements /opt/

# # Set up virtual environment
# RUN python3 -m venv /opt/venv
# ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
RUN pip3 install --upgrade pip && \
    pip3 install --no-cache-dir -r /opt/requirements

RUN mkdir -p /opt/logs || touch /opt/logs/app.log

# Copy entrypoint script
COPY entrypoint.sh /opt/
RUN chmod +x /opt/entrypoint.sh

# Set entrypoint
ENTRYPOINT ["/opt/entrypoint.sh"]
