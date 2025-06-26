interface StatusResponse {
  ai_running_status: string;
  cameras: {
    cameras_status: { camera_id: number; camera_type: string; fps: number; height: number; is_active: boolean; width: number }[];
    is_stereo_camera_available: boolean;
    realsense_available: boolean;
    video_cameras_ids: number[];
  };
  is_recording: boolean;
  leader_follower_status: boolean;
  name: string;
  robot_status: { device_name: string; name: string; robot_type: string }[];
  robots: string[];
  server_ip: string;
  status: string;
  version_id: string;
}

export const API_BASE = 'http://127.0.0.1:80';

export async function getStatus(): Promise<StatusResponse> {
  const res = await fetch(`${API_BASE}/status`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Status api call failed: ${res.statusText}`);
  }

  return res.json();
}
