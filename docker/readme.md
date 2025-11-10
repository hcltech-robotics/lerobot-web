# Docker images

## Warm-up step

Change the robots path in docker-compose.yml to the correct path before start:

```bash
devices:
- "/dev/--leader1--:/dev/ttyACM0"
- "/dev/--follower1--:/dev/ttyACM1"
```

## Start

Run the following command in the docker folder:

```bash
docker compose up --build
```
