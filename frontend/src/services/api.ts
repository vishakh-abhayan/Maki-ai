const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://yagafoods.com';

export interface Task {
  _id: string;
  transcript_id: string;
  filename: string;
  title: string;
  from: string;
  due_date: string | null;
  due_date_text: string | null;
  priority: 'high' | 'normal' | 'low';
  category: string;
  extracted_from: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reminder extends Task {}

class APIService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async getTasks(): Promise<Task[]> {
    try {
      const response = await fetch(`${this.baseURL}/reminders/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  async getReminders(): Promise<Reminder[]> {
    try {
      const response = await fetch(`${this.baseURL}/reminders/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching reminders:', error);
      throw error;
    }
  }

  async updateTaskStatus(taskId: string, completed: boolean): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/reminders/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }
}

export const apiService = new APIService();