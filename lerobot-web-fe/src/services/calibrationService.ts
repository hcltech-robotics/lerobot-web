type StartResponse = {
  status: string;
  message: string;
};

export async function startCalibration(): Promise<StartResponse> {
  // WIP calibration function

  return { status: 'ok', message: 'calibration finished' };
}
