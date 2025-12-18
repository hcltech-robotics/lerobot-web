import asyncio
import signal
from typing import Optional

class EvalProcessManager:
    def __init__(self):
        self.proc: Optional[asyncio.subprocess.Process] = None

    def is_running(self) -> bool:
        return self.proc is not None and self.proc.returncode is None

    async def start(self, args: list[str], cwd: str | None = None, env: dict | None = None) -> int:
        if self.is_running():
            await self.stop()
        self.proc = await asyncio.create_subprocess_exec(
            *args,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
            cwd=cwd,
            env=env,
        )
        return self.proc.pid

    async def stop(self) -> None:
        if self.proc is None:
            return
        if self.proc.returncode is None:
            self.proc.send_signal(signal.SIGINT)
            try:
                await asyncio.wait_for(self.proc.wait(), timeout=5)
            except asyncio.TimeoutError:
                self.proc.kill()
                await self.proc.wait()
        self.proc = None

    async def stream_lines(self):
        if not self.is_running() or self.proc.stdout is None:
            return
        while self.is_running():
            line = await self.proc.stdout.readline()
            if not line:
                break
            yield line.decode(errors="replace").rstrip("\n")

manager = EvalProcessManager()
