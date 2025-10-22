export const mockConversationDetails = {
  _id: "mock-123",
  title: "Project Discussion with Sarah",
  summary: {
    short: "Discussed Q4 project timeline and deliverables",
    extended:
      "Had a comprehensive discussion about the Q4 project timeline, key deliverables, and resource allocation. Sarah mentioned the need for additional developers and expressed concerns about the current deadline. We agreed to revisit the schedule next week with updated estimates from the engineering team.",
  },
  participants: [
    { _id: "user-1", name: "You", isUser: true },
    { _id: "user-2", name: "Sarah Johnson", isUser: false },
    { _id: "user-3", name: "Mike Chen", isUser: false },
  ],
  conversationDate: "2025-10-20T14:30:00Z",
  duration: 45,
  tags: ["work", "project-planning", "deadline"],
  transcriptId: "transcript-123",
};

export const mockPersonDetail = {
  id: "person-123",
  name: "Sarah Johnson",
  relationship: {
    type: "colleague",
    displayText: "Colleague",
  },
  communication: {
    lastContactedFormatted: "2 days ago",
    frequencyLabel: "Weekly",
    frequencyBadgeColor: "green",
  },
  profile: {
    summary:
      "Sarah is a senior product manager with 8 years of experience in tech. She's passionate about user experience and agile methodologies. Known for her strategic thinking and ability to bridge the gap between technical and business teams.",
    hobbies: ["Photography", "Hiking", "Reading sci-fi novels"],
  },
  sentiment: {
    closenessScore: 0.75,
    closenessPercentage: 75,
  },
  recentConversations: [
    {
      id: "conv-1",
      title: "Q4 Planning Meeting",
      summary:
        "Discussed roadmap priorities and resource allocation for the upcoming quarter.",
      dateFormatted: "Oct 18, 2025",
      tags: ["planning", "work"],
    },
    {
      id: "conv-2",
      title: "Product Launch Review",
      summary:
        "Reviewed the success metrics of our recent product launch and identified areas for improvement.",
      dateFormatted: "Oct 10, 2025",
      tags: ["product", "review"],
    },
  ],
};

export const mockTranscriptMessages = [
  {
    speaker: "You",
    text: "Hey Sarah, thanks for making time to discuss the Q4 roadmap.",
    isUser: true,
  },
  {
    speaker: "Sarah Johnson",
    text: "Of course! I'm excited to dive into this. I've been thinking a lot about our priorities.",
    isUser: false,
  },
  // ... add more messages
];
