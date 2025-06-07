import { useEffect, useState } from 'react';
import { startTeleoperate, stopTeleoperate } from '../services/teleoperateService';
import { MainScene } from './MainScene';
import { Robot } from './Robot';

export interface JointState {
  rotation: number;
  pitch: number;
  elbow: number;
  wristPitch: number;
  wristRoll: number;
  jaw: number;
};

export default function Teleoperate() {
  const [status, setStatus] = useState<string>('');
  const [pid, setPid] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [jointState, setJointState] = useState<JointState | null>(null);
  const [videoStream, setVideoStream] = useState<string | null>(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8000/ws/joint_state');

    socket.onmessage = (event) => {
      const data: JointState = JSON.parse(event.data);
      setJointState(data);
    };

    socket.onclose = () => {
      console.log('WebSocket closed for joint state');
    };

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8000/ws/video');

    socket.onmessage = (event) => {
      const data = `data:image/jpeg;base64,${JSON.parse(event.data).data}`;
      setVideoStream(data);
    };

    socket.onclose = () => {
      console.log('WebSocket closed for video');
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleStart = async () => {
    setLoading(true);
    setError(null);

    try {
      const { status, pid } = await startTeleoperate();
      setStatus(status);
      setPid(pid);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (pid === null) return;

    setLoading(true);
    setError(null);

    try {
      const { status } = await stopTeleoperate(pid);
      setStatus(status);
      setPid(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const statusText = loading ? 'loading...' : (status || ' - ').concat(pid ? ` - pid: ${pid}` : '');

  return (
    <>
      <p>Teleoperated status:</p>
      <p>{statusText}</p>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <button onClick={handleStart} disabled={!!pid || loading}>
        Start teleoperate
      </button>
      <button onClick={handleStop} disabled={!pid || loading}>
        Stop teleoperate
      </button>
      {videoStream && <img src={videoStream} />}
      <MainScene>
        <Robot jointState={jointState} />
      </MainScene>
    </>
  );
}
