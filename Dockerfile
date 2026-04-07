# Use the official lightweight Python image.
FROM python:3.10-slim

# Hugging Face requires a non-root user with UID 1000
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
# Note: We copy as the 'user' to ensure proper permissions
COPY --chown=user requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy the backend and data directories into the container at /app
COPY --chown=user backend ./backend
COPY --chown=user data ./data

# Expose the port Hugging Face Spaces expects
EXPOSE 7860

# Run the application using uvicorn
# Note: We use 'backend.main:app' because main.py is in the backend/ folder
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
