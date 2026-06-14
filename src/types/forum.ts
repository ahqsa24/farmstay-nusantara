export type StoryStatus = "draft" | "pending" | "approved" | "rejected";

export interface ForumStory {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  status: StoryStatus;
  rejection_reason: string | null;
  author_id: number;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateForumStoryPayload {
  title: string;
  content: string;
  image_url?: string;
}

export interface VerifyForumStoryPayload {
  status: "approved" | "rejected";
  rejection_reason?: string;
}
