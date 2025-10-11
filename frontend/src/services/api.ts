const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Task {
  _id: string;
  transcriptId: string;
  userId: string;
  filename: string;
  title: string;
  from: string;
  dueDate: string | null;
  dueDateText: string | null;
  priority: 'high' | 'normal' | 'low';
  category: string;
  extractedFrom: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder extends Task {}

export interface TranscriptResponse {
  transcript: string;
  insights: {
    [speaker: string]: {
      action_items: string[];
      key_information: string[];
    };
  };
  reminders: Array<{
    title: string;
    from: string;
    due_date_text: string | null;
    priority: string;
    category: string;
    extracted_from: string;
  }>;
  detected_speakers?: number;
}

class APIService {
  private baseURL: string;
  private getToken: () => Promise<string | null>;

  constructor(baseURL: string, getToken: () => Promise<string | null>) {
    this.baseURL = baseURL;
    this.getToken = getToken;
  }

  private async getHeaders(): Promise<HeadersInit> {
    const token = await this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async uploadAudio(audioFile: File, numSpeakers: number): Promise<TranscriptResponse> {
    const token = await this.getToken();
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('num_speakers', numSpeakers.toString());

    const response = await fetch(`${this.baseURL}/transcribe`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return await response.json();
  }

  async getTasks(): Promise<Task[]> {
    const response = await fetch(`${this.baseURL}/tasks`, {
      method: 'GET',
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async getReminders(): Promise<Reminder[]> {
    const response = await fetch(`${this.baseURL}/reminders`, {
      method: 'GET',
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async updateTaskStatus(taskId: string, completed: boolean): Promise<void> {
    const response = await fetch(`${this.baseURL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: JSON.stringify({ completed }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async updateReminderStatus(reminderId: string, completed: boolean): Promise<void> {
    const response = await fetch(`${this.baseURL}/reminders/${reminderId}`, {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: JSON.stringify({ completed }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
}

export const createAPIService = (getToken: () => Promise<string | null>) => {
  return new APIService(API_BASE_URL, getToken);
};