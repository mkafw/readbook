export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  totalChapters: number;
  category: string;
  coverUrl?: string;
}

export interface BookChapter {
  bookId: string;
  chapterNumber: number;
  title: string;
  content: string;
  wordCount: number;
}

export interface Bookmark {
  id: string;
  bookId: string;
  chapterNumber: number;
  pageNumber: number;
  note?: string;
  createdAt: Date;
}

export interface ReadingProgress {
  bookId: string;
  currentChapter: number;
  currentPage: number;
  completedChapters: number[];
  lastReadAt: Date;
  totalReadingTime: number;
}

export interface ReadingStats {
  totalBooks: number;
  completedBooks: number;
  totalReadingTime: number;
  currentStreak: number;
}
