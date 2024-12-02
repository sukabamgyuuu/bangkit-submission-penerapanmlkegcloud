# Gunakan image Node.js
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy seluruh kode aplikasi
COPY . .

# Expose port aplikasi
EXPOSE 3000

# Start aplikasi
CMD ["npm", "start"]
