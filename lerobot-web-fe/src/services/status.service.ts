import { useStatusStore } from '../stores/status.store';

export interface StatusResponse {
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
  robot_status: { device_name: string | null; name: string; robot_type: string }[];
  robots: string[];
  server_ip: string;
  status: string;
  version_id: string;
}

export async function getStatus(): Promise<StatusResponse> {
  const { apiUrl } = useStatusStore.getState();
  const setStatus = useStatusStore.getState().setStatus;

  if (!apiUrl) throw new Error('API URL not set. Please configure the system.');

  try {
    const statusResponse = await fetch(`${apiUrl}/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const response = await statusResponse.json();
    setStatus(response);
    return response;
  } catch (error) {
    console.error('Status lekérdezési hiba:', error);
    throw error;
  }
}
