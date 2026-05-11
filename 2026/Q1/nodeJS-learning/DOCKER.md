# Docker Setup Guide

This project includes Docker configuration for containerized deployment of the E-commerce API with MongoDB.

## Files Created

- **docker-compose.yml** - Docker Compose configuration for orchestrating services
- **Dockerfile** - Multi-stage build for Node.js application
- **.dockerignore** - Files to exclude from Docker build context
- **init-mongo.js** - MongoDB initialization script
- **.env.docker** - Docker-specific environment variables

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- macOS, Linux, or Windows with Docker installed

## Quick Start

### 1. Build and Start Services

```bash
# Start all services in the background
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f app
docker-compose logs -f mongo
```

### 2. Verify Services are Running

```bash
# Check service status
docker-compose ps

# Test API health
curl http://localhost:3000/api/health
```

### 3. Stop Services

```bash
# Stop all services (keeps data)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove everything including volumes (deletes data)
docker-compose down -v
```

## Configuration

### Environment Variables

The `docker-compose.yml` already includes all necessary environment variables:

- `PORT`: 3000
- `MONGO_URL`: MongoDB connection string for Docker network
- `JWT_SECRET`: Secret key for JWT tokens
- `FRONTEND_URL`: Frontend application URL

To customize, edit the `environment` section in `docker-compose.yml` or create a `.env` file:

```bash
# Create .env file
cp .env.docker .env

# Edit .env file with your values
nano .env
```

### Database Credentials

Default MongoDB credentials (can be changed in docker-compose.yml):

- **Username**: admin
- **Password**: password
- **Database**: nodeLearning

## Development Workflow

### Hot Reload Development

The container mounts the `src` directory, allowing hot-reload with nodemon:

```bash
# Start services
docker-compose up

# Make changes to src files
# Changes will automatically reload the application
```

### Database Access

Connect to MongoDB from your host:

```bash
# Using MongoDB URI
mongodb://admin:password@localhost:27017/nodeLearning

# Using mongosh CLI
mongosh mongodb://admin:password@localhost:27017/nodeLearning
```

### View Application Logs

```bash
# Real-time logs
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app

# MongoDB logs
docker-compose logs -f mongo
```

## Common Commands

```bash
# Build images without starting
docker-compose build

# Rebuild app image (after dependency changes)
docker-compose build app

# Rebuild MongoDB image
docker-compose build mongo

# Run command in app container
docker-compose exec app npm run type-check

# Shell access to app container
docker-compose exec app sh

# Shell access to MongoDB container
docker-compose exec mongo sh

# Clean up everything and start fresh
docker-compose down -v && docker-compose up -d
```

## Troubleshooting

### Port Already in Use

If port 3000 or 27017 is already in use:

```yaml
# In docker-compose.yml, modify the ports section:
ports:
  - "3001:3000" # Changed from 3000:3000
  - "27018:27017" # Changed from 27017:27017
```

### Health Check Failures

If health checks are failing:

```bash
# Check app logs
docker-compose logs app

# Restart the app service
docker-compose restart app
```

### MongoDB Connection Issues

```bash
# Verify MongoDB is running
docker-compose ps mongo

# Check MongoDB logs
docker-compose logs mongo

# Restart MongoDB
docker-compose restart mongo
```

### Clear All Data

```bash
# Remove containers and volumes (deletes all data)
docker-compose down -v

# Rebuild and restart
docker-compose up -d --build
```

## Production Considerations

### Before Deploying to Production:

1. **Update Environment Variables**
   - Change `JWT_SECRET` to a strong value
   - Use production MongoDB URL or managed service
   - Update `FRONTEND_URL` to production domain
   - Set `NODE_ENV=production`

2. **Security**
   - Change MongoDB default credentials
   - Use environment file or secrets management
   - Enable authentication and SSL/TLS
   - Use docker secrets for sensitive data

3. **Resource Limits**
   - Add memory and CPU limits in docker-compose.yml:

   ```yaml
   services:
     app:
       deploy:
         resources:
           limits:
             cpus: "1"
             memory: 512M
   ```

4. **Persistence**
   - Ensure MongoDB volumes are backed up
   - Use managed database services in production
   - Implement backup strategies

5. **Monitoring**
   - Add logging aggregation
   - Set up monitoring and alerts
   - Monitor container resource usage

### Example Production Configuration

```yaml
# Use environment file
env_file:
  - .env.production

# Add restart policy
restart: always

# Add resource limits
deploy:
  resources:
    limits:
      cpus: "1"
      memory: 512M
```

## Docker Images

- **Node.js**: Alpine 20 (lightweight)
- **MongoDB**: Alpine 7.0 (lightweight)

Alpine images are used for smaller image sizes and faster builds.

## Network Architecture

```
┌─────────────────────────────────────────┐
│        ecommerce-network (bridge)       │
├─────────────────────────────────────────┤
│                                          │
│  ┌──────────────┐      ┌──────────────┐ │
│  │  app (Node)  │◄────►│ mongo (DB)   │ │
│  │ :3000        │      │ :27017       │ │
│  └──────────────┘      └──────────────┘ │
│       ▲                                   │
│       │                                   │
└───────┼───────────────────────────────────┘
        │
   Host Machine
   :3000, :27017
```

## Performance Tips

1. **Use Alpine images** - Already configured (Node 20-alpine, MongoDB-alpine)
2. **Multi-stage builds** - Dependencies cached separately
3. **Volume mounts** - Excludes node_modules from sync for better performance
4. **Health checks** - Ensures services are ready before dependencies start

## Useful Links

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
