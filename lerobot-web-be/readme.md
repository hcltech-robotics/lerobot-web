# LeRobot Backend

Created by Python based FastAPI web framework.

## Activate lerobot env

```bash
conda activate lerobot
```

## Install

Install dependecies via txt:

```bash
pip install -r requirements.txt
```

or,

```bash
pip install "fastapi[standard]" uvicorn starlette aiortc python-multipart opencv-python
```

Install a virtual display:

```bash
sudo api install xvfb
```

## Run

Run the application itself:

```
uvicorn app.main:app --reload
```

Then, you can check it in the browser, just open: http://127.0.0.1:8000

## Interactive API docs

There is an auto generated swagger ui for the available api point, just open: http://127.0.0.1:8000/docs#/
