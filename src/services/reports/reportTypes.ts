
export interface Report {
  id: string;
  title: string;
  description: string;
  location: string;
  issueType: string;
  images: string[];
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  upvotes: number;
  comments: Comment[];
  likes: number;
  createdBy: string;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  date: string;
}
