type StartResponse = {
  status: string;
  pid: number;
  message: string;
};

type StopResponse = {
  status: string;
  pid: number;
  message: string;
};

const API_BASE = "http://127.0.0.1:8000";

export async function startTeleoperate(): Promise<StartResponse> {
  const res = await fetch(`${API_BASE}/teleoperate`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({mode: "start"}),
  });

  if (!res.ok) {
    throw new Error(`Teleoperate start failed: ${res.statusText}`);
  }

  return res.json();
}

export async function stopTeleoperate(
  pid: number | null
): Promise<StopResponse> {
  if (pid === null) throw new Error("PID is required to stop teleoperate");

  const res = await fetch(`${API_BASE}/teleoperate`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({mode: "stop", pid}),
  });

  if (!res.ok) {
    throw new Error(`Teleoperate stop failed: ${res.statusText}`);
  }

  return res.json();
}
