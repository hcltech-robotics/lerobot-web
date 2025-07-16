import { useStatusStore } from '../stores/status.store';
import type { StatusResponse } from '../models/status.model';

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
    console.error('Error fetching status:', error);
    throw error;
  }
}
