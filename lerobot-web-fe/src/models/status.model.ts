import type { RobotStatus } from './robot.model';

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
  robot_status: RobotStatus[];
  robots: string[];
  server_ip: string;
  status: string;
  version_id: string;
}
