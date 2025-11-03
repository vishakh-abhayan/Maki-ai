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
  priority: "high" | "medium" | "normal" | "low"; // ✅ Added "medium" and "normal"
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
  priority: "high" | "medium" | "normal" | "low"; // ✅ Added "medium" and "normal"
  category: "meeting" | "call" | "event" | "deadline" | "personal";
  extractedFrom: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptResponse {
  success: boolean;
  message: string;
  transcript: string;
  // ✅ ADD: metadata property
  metadata?: {
    detectedLanguage: string;
    wasTranslated: boolean;
    numSpeakers: number;
    filename: string;
  };
  // ✅ ADD: conversation property
  conversation?: {
    id: string;
    title: string;
    summary: {
      short: string;
      extended: string;
    };
    participants: Array<{
      personId?: string;
      speakerLabel: string;
      name: string;
      isUser: boolean;
    }>;
  };
  // ✅ ADD: extracted data
  extracted?: {
    tasks: number;
    reminders: number;
    people: Array<{
      id: string;
      name: string;
      initials: string;
      relationship: any;
    }>;
    followups: number;
  };
  // Legacy fields (kept for backward compatibility)
  insights?: {
    [speaker: string]: {
      action_items: string[];
      key_information: string[];
    };
  };
  reminders?: Array<{
    title: string;
    from: string;
    due_date_text: string | null;
    priority: string;
    category: string;
    extracted_from: string;
  }>;
  detected_speakers?: number;
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

// Update the FollowUp interface
export interface FollowUp {
  _id: string;
  personId: string; // ✅ Changed from object to string (just the ID)
  person: string; // ✅ Added: Person's name
  initials: string; // ✅ Added: Person's initials
  avatar?: string; // ✅ Added: Person's avatar
  relationship: string; // ✅ Added: Person's relationship type
  type: "pending" | "suggested";
  priority: "high" | "medium" | "low";
  context: string;
  reason?: string;
  conversationTitle?: string; // ✅ Added: Title of related conversation
  conversationDate?: string; // ✅ Added: Date of related conversation
  suggestedDate?: string;
  completed: boolean;
  createdAt: string;
}

// Update the SuggestedFollowUp interface
export interface SuggestedFollowUp {
  personId: string;
  person: string;
  name: string; // ✅ Added for compatibility
  initials: string;
  avatar?: string;
  relationship: string;
  lastContacted?: string;
  frequency?: string;
  closeness?: number;
  reason?: string;
}

// Update IntelligenceDashboard interface
export interface IntelligenceDashboard {
  pendingFollowUps: FollowUp[];
  suggestedFollowUps: SuggestedFollowUp[]; // ✅ Changed from any[]
  latestInteractions: LatestInteraction[]; // ✅ Changed from any[]
  networkOverview: {
    totalPeople: number;
    closeContacts: number;
  };
}

// Update LatestInteraction interface
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

  async uploadAudio(audioFile: File): Promise<TranscriptResponse> {
    const token = await this.getToken();
    const formData = new FormData();
    formData.append("file", audioFile);

    const response = await fetch(`${this.baseURL}/transcribe`, {
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

    return await response.json();
  }

  async getTasks(): Promise<Task[]> {
    const response = await fetch(`${this.baseURL}/tasks`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async getReminders(): Promise<Reminder[]> {
    const response = await fetch(`${this.baseURL}/reminders`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async updateTaskStatus(taskId: string, completed: boolean): Promise<void> {
    const response = await fetch(`${this.baseURL}/tasks/${taskId}`, {
      method: "PATCH",
      headers: await this.getHeaders(),
      body: JSON.stringify({ completed }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async updateReminderStatus(
    reminderId: string,
    completed: boolean
  ): Promise<void> {
    const response = await fetch(`${this.baseURL}/reminders/${reminderId}`, {
      method: "PATCH",
      headers: await this.getHeaders(),
      body: JSON.stringify({ completed }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  // Get Intelligence Dashboard Data
  async getIntelligenceDashboard(): Promise<IntelligenceDashboard> {
    const response = await fetch(`${this.baseURL}/intelligence/dashboard`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Get All People
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
      `${this.baseURL}/people?${queryParams.toString()}`,
      {
        method: "GET",
        headers: await this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Get Single Person Details
  async getPersonDetails(personId: string): Promise<Person> {
    if (!personId || personId === "undefined") {
      throw new Error("Invalid person ID");
    }
    const response = await fetch(`${this.baseURL}/people/${personId}`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Get Follow-ups
  async getFollowUps(
    type?: "all" | "pending" | "suggested"
  ): Promise<FollowUp[]> {
    let endpoint = `${this.baseURL}/followups`;

    if (type === "pending") {
      endpoint = `${this.baseURL}/followups/pending`;
    } else if (type === "suggested") {
      endpoint = `${this.baseURL}/followups/suggested`;
    }

    const response = await fetch(endpoint, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Update Follow-up
  async updateFollowUp(
    followUpId: string,
    data: { completed?: boolean; priority?: string; context?: string }
  ): Promise<void> {
    const response = await fetch(`${this.baseURL}/followups/${followUpId}`, {
      method: "PATCH",
      headers: await this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  // Initiate Contact (Call/Message)
  async initiateContact(
    personId: string,
    contactType: "call" | "message" | "email"
  ): Promise<void> {
    const response = await fetch(`${this.baseURL}/people/${personId}/contact`, {
      method: "POST",
      headers: await this.getHeaders(),
      body: JSON.stringify({ contactType }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  // Get History/Conversations
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
      `${this.baseURL}/history?${queryParams.toString()}`,
      {
        method: "GET",
        headers: await this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Get Single Conversation Details
  async getConversationDetails(conversationId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/history/${conversationId}`, {
      method: "GET",
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Search People
  async searchPeople(query: string): Promise<Person[]> {
    const response = await fetch(
      `${this.baseURL}/people?search=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: await this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

export const createAPIService = (getToken: () => Promise<string | null>) => {
  return new APIService(API_BASE_URL, getToken);
};
