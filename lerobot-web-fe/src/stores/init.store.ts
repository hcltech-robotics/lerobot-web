import { API_URL_KEY, SELECTED_LEADER_KEY, STATUS_KEY } from '../models/status.model';
import { useStatusStore } from './status.store';

export const initializeStoresFromLocalStorage = () => {
  const statusRaw = localStorage.getItem(STATUS_KEY);
  if (statusRaw !== null) {
    try {
      const status = JSON.parse(statusRaw);
      useStatusStore.getState().setStatus(status);
    } catch (err) {
      console.error('Incorrect status data in localStorage:', err);
    }
  }

  const selectedLeaderRaw = localStorage.getItem(SELECTED_LEADER_KEY);
  if (selectedLeaderRaw !== null) {
    try {
      const selectedLeader = selectedLeaderRaw;
      useStatusStore.getState().setSelectedLeader(selectedLeader);
    } catch (err) {
      console.error('Incorrect selectedLeader data in localStorage:', err);
    }
  }

  const apiUrlRaw = localStorage.getItem(API_URL_KEY);
  if (apiUrlRaw !== null) {
    try {
      const apiUrl = apiUrlRaw;
      useStatusStore.getState().setApiUrl(apiUrl);
    } catch (err) {
      console.error('Incorrect apiUrl data in localStorage:', err);
    }
  }
};
