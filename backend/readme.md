# LeRobot Backend

Created by Python based FastAPI web framework.

## Install

```
pip install "fastapi[standard]" uvicorn starlette aiortc python-multipart opencv-python
```

Set a virtual display (if needed):
```
sudo api install xvfb
Xvfb :0 -screen 0 1024x768x24&
export DISPLAY=:0
```

## Run

Run the application itself:
```
uvicorn main:app --reload
```

Then, you can check it in the browser, just open: http://127.0.0.1:8000

## Interactive API docs

There is an auto generated swagger ui for the available api point, just open: http://127.0.0.1:8000/docs#/
