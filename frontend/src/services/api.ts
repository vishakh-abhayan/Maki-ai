const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface Task {
  _id: string;
  transcriptId: string;
  userId: string;
  filename: string;
  title: string;
  from: string | null;
  dueDate: string | null;
  dueDateText: string;
  priority: "high" | "medium" | "normal" | "low";
  category: string;
  extractedFrom: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  _id: string;
  transcriptId: string;
  userId: string;
  filename: string;
  title: string;
  from: string | null;
  dueDate: string | null;
  dueDateText: string;
  priority: "high" | "medium" | "normal" | "low";
  category: "meeting" | "call" | "event" | "deadline" | "personal";
  extractedFrom: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptResponse {
  transcript: string;
  metadata: {
    detectedLanguage: string;
    wasTranslated: boolean;
    numSpeakers: number;
    filename: string;
  };
  conversation: {
    id: string;
    title: string;
    summary: string;
    participants: string[];
  };
  extracted: {
    tasks: number;
    reminders: number;
    people: number;
    followups: number;
  };
}

// ✅ This is what uploadAudio returns (just the jobId)
export interface UploadAudioResponse {
  jobId: string;
  message: string;
}

// ✅ This is what getJobStatus returns
export interface JobStatus {
  jobId: string;
  state: "waiting" | "active" | "completed" | "failed";
  progress: number;
  result?: TranscriptResponse; // When completed, contains the full TranscriptResponse
  failedReason?: string;
  processedOn?: number;
  finishedOn?: number;
  attemptsMade?: number;
  timestamp?: number;
}

export interface Person {
  _id: string;
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  relationship: {
    type: string;
    subtype?: string;
    displayText: string;
  };
  communication: {
    lastContacted: string;
    lastContactedFormatted: string;
    frequency: string;
    frequencyLabel: string;
    frequencyBadgeColor: string;
    totalConversations: number;
    conversationCounter: number;
  };
  sentiment: {
    closenessScore: number;
    closenessPercentage: number;
    tone: string;
  };
  profile: {
    summary: string;
    hobbies: string[];
    interests: string[];
    favorites: {
      movies: string[];
      music: string[];
      books: string[];
      food: string[];
    };
    travel: string[];
    workInfo: any;
    personalInfo: any;
  };
  mostDiscussedTopics: string[];
  recentConversations: ConversationSummary[];
  connections: PersonConnection[];
}

export interface PersonConnection {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  relationshipType: string;
  strength: number;
}

export interface ConversationSummary {
  id: string;
  title: string;
  summary: string;
  date: string;
  dateFormatted: string;
  duration: number;
  tags: string[];
  hasActionItems: boolean;
}

export interface FollowUp {
  _id: string;
  personId: string;
  person: string;
  initials: string;
  avatar?: string;
  relationship: string;
  type: "pending" | "suggested";
  priority: "high" | "medium" | "low";
  context: string;
  reason?: string;
  conversationTitle?: string;
  conversationDate?: string;
  suggestedDate?: string;
  completed: boolean;
  createdAt: string;
}

export interface SuggestedFollowUp {
  personId: string;
  person: string;
  name: string;
  initials: string;
  avatar?: string;
  relationship: string;
  lastContacted?: string;
  frequency?: string;
  closeness?: number;
  reason?: string;
}

export interface IntelligenceDashboard {
  pendingFollowUps: FollowUp[];
  suggestedFollowUps: SuggestedFollowUp[];
  latestInteractions: LatestInteraction[];
  networkOverview: {
    totalPeople: number;
    closeContacts: number;
  };
}

export interface LatestInteraction {
  personId: string;
  name: string;
  initials: string;
  avatar?: string;
  relationship: string;
  lastConversationTitle?: string;
  lastConversationDate: string;
  lastConversationSummary?: string;
}

export interface Conversation {
  _id: string;
  id: string;
  title: string;
  participants: string;
  summary: string;
  date: string;
  duration: string;
  tags: string[];
}

export interface PaginatedResponse<T> {
  conversations?: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
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
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private extractData<T>(response: any): T {
    if (
      response &&
      response.success !== undefined &&
      response.data !== undefined
    ) {
      return response.data;
    }
    return response;
  }

  // ✅ CHANGED: Returns UploadAudioResponse (with jobId)
  async uploadAudio(audioFile: File): Promise<UploadAudioResponse> {
    const token = await this.getToken();
    const formData = new FormData();
    formData.append("file", audioFile);

    const response = await fetch(`${this.baseURL}/api/v1/transcribe`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const data = await response.json();
    return this.extractData(data);
  }

  async getJobStatus(jobId: string): Promise<JobStatus> {
    const token = await this.getToken();
    const response = await fetch(
      `${this.baseURL}/api/v1/transcribe/job/${jobId}`,
      {
        method: "GET",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return this.extractData(data);
  }

  async getTasks(): Promise<Task[]> {
    const response = await fetch(
      `${this.baseURL}/api/v1/tasks?completed=false`,
      {
        method: "GET",
        headers: await this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return this.extractData(data);
  }

  async getReminders(): Promise<Reminder[]> {
    const response = await fetch(
      `${this.baseURL}/api/v1/reminders?completed=false`,
      {
        method: "GET",
        headers: await this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return this.extractData(data);
  }

  async updateTaskStatus(taskId: string, completed: boolean): Promise<void> {
    const response = await fetch(
      `${this.baseURL}/api/v1/tasks/${taskId}/toggle`,
      {
        method: "PATCH",
        headers: await this.getHeaders(),
        body: JSON.stringify({ completed }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async updateReminderStatus(
    reminderId: string,
    completed: boolean
  ): Promise<void> {
    const response = await fetch(
      `${this.baseURL}/api/v1/reminders/${reminderId}/toggle`,
      {
        method: "PATCH",
        headers: await this.getHeaders(),
        body: JSON.stringify({ completed }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async getIntelligenceDashboard(): Promise<IntelligenceDashboard> {
    const response = await fetch(
      `${this.baseURL}/api/v1/intelligence/dashboard`,
      {
        method: "GET",
        headers: await this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return this.extractData(data);
  }

  async getPeople(params?: {
    search?: string;
    relationship?: string;
    sortBy?: string;
    limit?: number;
  }): Promise<Person[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append("search", params.search);
    if (params?.relationship)
      queryParams.append("relationship", params.relationship);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const response = await fetch(
      `${this.baseURL}/api/v1/people?${queryParams.toString()}`,
      {
        method: "GET",
        headers: await this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return this.extractData(data);
  }

  async getPersonDetails(personId: string): Promise<Person> {
    if (!personId || personId === "undefined") {
      throw new Error("Invalid person ID");
    }
    const response = await fetch(`${this.baseURL}/api/v1/people/${personId}`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return this.extractData(data);
  }

  async getFollowUps(
    type?: "all" | "pending" | "suggested"
  ): Promise<FollowUp[]> {
    let endpoint = `${this.baseURL}/api/v1/followups`;

    if (type === "pending") {
      endpoint += "?status=pending";
    }

    const response = await fetch(endpoint, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return this.extractData(data);
  }

  async updateFollowUp(
    followUpId: string,
    data: { completed?: boolean; priority?: string; context?: string }
  ): Promise<void> {
    const response = await fetch(
      `${this.baseURL}/api/v1/followups/${followUpId}`,
      {
        method: "PATCH",
        headers: await this.getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async initiateContact(
    personId: string,
    contactType: "call" | "message" | "email"
  ): Promise<void> {
    const response = await fetch(
      `${this.baseURL}/api/v1/people/${personId}/contact`,
      {
        method: "POST",
        headers: await this.getHeaders(),
        body: JSON.stringify({ contactType }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async getConversations(params?: {
    page?: number;
    limit?: number;
    search?: string;
    personId?: string;
    dateRange?: string;
  }): Promise<PaginatedResponse<Conversation>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.personId) queryParams.append("personId", params.personId);
    if (params?.dateRange) queryParams.append("dateRange", params.dateRange);

    const response = await fetch(
      `${this.baseURL}/api/v1/conversations?${queryParams.toString()}`,
      {
        method: "GET",
        headers: await this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      conversations: this.extractData(data) || [],
      pagination: data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 20,
      },
    };
  }

  async getConversationDetails(conversationId: string): Promise<any> {
    const response = await fetch(
      `${this.baseURL}/api/v1/conversations/${conversationId}`,
      {
        method: "GET",
        headers: await this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return this.extractData(data);
  }

  async searchPeople(query: string): Promise<Person[]> {
    const response = await fetch(
      `${this.baseURL}/api/v1/people?search=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: await this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return this.extractData(data);
  }
}

export const createAPIService = (getToken: () => Promise<string | null>) => {
  return new APIService(API_BASE_URL, getToken);
};
