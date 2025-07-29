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

## Clone the `lerobot` repository into the root directory:

```bash
git clone https://github.com/huggingface/lerobot
```

## Navigate into the `lerobot` folder and install the package:

```bash
cd lerobot
pip install -e .
```

## Verify the installation from the root directory:

```bash
python -c "import lerobot; print(lerobot.__file__)"
```

## If necessary, install the following additional packages:

```bash
pip install feetech-servo-sdk
pip install placo
```

## Start the app:

Run the application itself:

```
uvicorn app.main:app --reload
```

Then, you can check it in the browser, just open: http://127.0.0.1:8000

## Interactive API docs:

There is an auto generated swagger ui for the available api point, just open: http://127.0.0.1:8000/docs#/
