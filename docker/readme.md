# Docker Setup

This project runs two components inside Docker containers:
- **Backend** (FastAPI)
- **Frontend** (React + Nginx)

---

## Preparation (one-time setup)

Before starting the containers, open **`docker/docker-compose.yml`** and make sure the device paths match your system configuration.

### 1. Robots (USB serial devices)

Each robot connects via USB and appears under `/dev/ttyACM*` or as a custom udev alias.

Example:
```yaml
devices:
  - "/dev/robot_leader_1:/dev/ttyACM0"
  - "/dev/robot_follower_1:/dev/ttyACM1"
```
If you have custom udev rules (e.g. /dev/robot_leader_1), use those names directly — they are more stable and won’t change after reconnecting the device.

### 2. Cameras (optional)

If you connect cameras via USB, add them to the `devices:` section as well.
For example, if your camera appears as `/dev/camera_wrist` on the host:

Example:
```yaml
devices:
  - "/dev/camera_wrist:/dev/video0"
```

You can list available cameras with ls -l /dev/v4l/by-id/.

## Starting the containers

From the docker/ directory, run:

```bash
docker compose up --build
```

- On the first run, Docker will build both frontend and backend images.
- The --build flag ensures the images are rebuilt if you’ve made changes.

## Access after startup

Once the build is complete, both services will be available locally:

| Service | URL | Description |
| ------ | ------ | ------ |
| Backend | [http://localhost:8000/docs](http://localhost:8000/docs) | Swagger API documentation |
| Frontend | [http://localhost:8080/](http://localhost:8080/) | Web interface |

## Useful commands

- Stop all containers:

```bash
docker compose down
```

- Rebuild only the backend:
```bash
docker compose build backend && docker compose up backend
```

- View logs in real-time:
```bash
docker compose logs -f
```

## Troubleshooting

| Issue | Possible Cause | Solution |
| ------ | ------ | ------ |
| Robots not detected | Wrong `/dev/...` path in docker compose file | Check with `ls /dev/tty*` or `udevadm info -n /dev/ttyACM0` |
| Camera not working | Missing udev rule or wrong path in docker compose file | Check with `ls -l /dev/v4l/by-id/` |
| Frontend shows 404 on refresh | SPA fallback missing | Already fixed in the Nginx config just use `default.conf` file |
