import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { Book, BookChapter, Bookmark, ReadingProgress, ReadingStats } from "./types.js";

class ReadbookMcpServer {
  private server: McpServer;
  private books: Map<string, Book> = new Map();
  private chapters: Map<string, BookChapter[]> = new Map();
  private bookmarks: Map<string, Bookmark[]> = new Map();
  private readingProgress: Map<string, ReadingProgress> = new Map();

  constructor() {
    this.server = new McpServer({
      name: "readbook-mcp-server",
      version: "1.0.0",
    });

    this.initializeMockData();
    this.setupTools();
    this.setupResources();
    this.setupPrompts();
  }

  private initializeMockData() {
    const mockBooks: Book[] = [
      {
        id: "book_001",
        title: "JavaScript高级程序设计",
        author: "Nicholas C. Zakas",
        description: "深入理解JavaScript语言核心概念和高级特性的权威指南",
        totalChapters: 25,
        category: "技术",
        coverUrl: "https://example.com/covers/js_advanced.jpg"
      },
      {
        id: "book_002",
        title: "人类简史",
        author: "尤瓦尔·赫拉利",
        description: "从十万年前有生命迹象开始到21世纪资本、科技交织的人类发展史",
        totalChapters: 20,
        category: "历史",
        coverUrl: "https://example.com/covers/sapiens.jpg"
      },
      {
        id: "book_003",
        title: "百年孤独",
        author: "加西亚·马尔克斯",
        description: "魔幻现实主义文学的代表作，描写布恩迪亚家族七代人的传奇故事",
        totalChapters: 20,
        category: "文学",
        coverUrl: "https://example.com/covers/one_hundred_years.jpg"
      }
    ];

    mockBooks.forEach(book => {
      this.books.set(book.id, book);
      this.chapters.set(book.id, this.generateMockChapters(book.id, book.totalChapters));
      this.bookmarks.set(book.id, []);
      this.readingProgress.set(book.id, {
        bookId: book.id,
        currentChapter: 1,
        currentPage: 1,
        completedChapters: [],
        lastReadAt: new Date(),
        totalReadingTime: 0
      });
    });
  }

  private generateMockChapters(bookId: string, totalChapters: number): BookChapter[] {
    const chapters: BookChapter[] = [];
    for (let i = 1; i <= totalChapters; i++) {
      chapters.push({
        bookId,
        chapterNumber: i,
        title: `第${i}章`,
        content: `这是第${i}章的内容。在这一章中，我们将深入探讨相关的主题和概念。\n\n通过详细的分析和实例，帮助读者更好地理解核心思想。\n\n本章包含了丰富的案例和实践建议，让读者能够将理论知识应用到实际场景中。`,
        wordCount: Math.floor(Math.random() * 2000) + 1000
      });
    }
    return chapters;
  }

  private setupTools() {
    this.server.registerTool(
      "search_books",
      {
        title: "搜索书籍",
        description: "根据关键词搜索书籍，支持按标题、作者或分类搜索",
        inputSchema: {
          query: z.string().describe("搜索关键词"),
          searchType: z.enum(["title", "author", "category"]).optional().describe("搜索类型：title（标题）、author（作者）、category（分类）"),
          limit: z.number().min(1).max(50).default(10).describe("返回结果数量限制")
        },
      },
      async ({ query, searchType = "title", limit }) => {
        const results: Book[] = [];
        
        for (const book of this.books.values()) {
          if (results.length >= limit) break;
          
          const match = searchType === "title" && book.title.toLowerCase().includes(query.toLowerCase()) ||
                       searchType === "author" && book.author.toLowerCase().includes(query.toLowerCase()) ||
                       searchType === "category" && book.category.toLowerCase().includes(query.toLowerCase());
          
          if (match) {
            results.push(book);
          }
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                total: results.length,
                books: results
              }, null, 2)
            }
          ]
        };
      }
    );

    this.server.registerTool(
      "get_book_content",
      {
        title: "获取书籍内容",
        description: "获取指定书籍的章节内容",
        inputSchema: {
          bookId: z.string().describe("书籍ID"),
          chapterNumber: z.number().min(1).describe("章节号"),
        },
      },
      async ({ bookId, chapterNumber }) => {
        const book = this.books.get(bookId);
        if (!book) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: "书籍不存在" })
              }
            ]
          };
        }

        const chapters = this.chapters.get(bookId);
        if (!chapters || chapterNumber > chapters.length) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: "章节不存在" })
              }
            ]
          };
        }

        const chapter = chapters[chapterNumber - 1];
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                bookId,
                bookTitle: book.title,
                chapterNumber: chapter.chapterNumber,
                chapterTitle: chapter.title,
                content: chapter.content,
                wordCount: chapter.wordCount
              }, null, 2)
            }
          ]
        };
      }
    );

    this.server.registerTool(
      "add_bookmark",
      {
        title: "添加书签",
        description: "在指定位置添加书签",
        inputSchema: {
          bookId: z.string().describe("书籍ID"),
          chapterNumber: z.number().min(1).describe("章节号"),
          pageNumber: z.number().min(1).describe("页码"),
          note: z.string().optional().describe("书签备注")
        },
      },
      async ({ bookId, chapterNumber, pageNumber, note }) => {
        const book = this.books.get(bookId);
        if (!book) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: "书籍不存在" })
              }
            ]
          };
        }

        const bookmark: Bookmark = {
          id: `bookmark_${Date.now()}`,
          bookId,
          chapterNumber,
          pageNumber,
          note,
          createdAt: new Date()
        };

        const bookBookmarks = this.bookmarks.get(bookId) || [];
        bookBookmarks.push(bookmark);
        this.bookmarks.set(bookId, bookBookmarks);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                success: true,
                bookmarkId: bookmark.id,
                message: "书签添加成功"
              })
            }
          ]
        };
      }
    );

    this.server.registerTool(
      "get_bookmarks",
      {
        title: "获取书签",
        description: "获取指定书籍的所有书签",
        inputSchema: {
          bookId: z.string().describe("书籍ID")
        },
      },
      async ({ bookId }) => {
        const book = this.books.get(bookId);
        if (!book) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: "书籍不存在" })
              }
            ]
          };
        }

        const bookBookmarks = this.bookmarks.get(bookId) || [];
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                bookId,
                bookTitle: book.title,
                bookmarks: bookBookmarks
              }, null, 2)
            }
          ]
        };
      }
    );

    this.server.registerTool(
      "get_reading_progress",
      {
        title: "获取阅读进度",
        description: "获取指定书籍的阅读进度",
        inputSchema: {
          bookId: z.string().describe("书籍ID")
        },
      },
      async ({ bookId }) => {
        const book = this.books.get(bookId);
        if (!book) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: "书籍不存在" })
              }
            ]
          };
        }

        const progress = this.readingProgress.get(bookId);
        const completedChapters = progress?.completedChapters || [];
        const totalChapters = book.totalChapters;
        const progressPercentage = (completedChapters.length / totalChapters) * 100;

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                bookId,
                bookTitle: book.title,
                currentChapter: progress?.currentChapter || 1,
                currentPage: progress?.currentPage || 1,
                completedChapters: completedChapters.length,
                totalChapters,
                progressPercentage: Math.round(progressPercentage),
                lastReadAt: progress?.lastReadAt,
                totalReadingTime: progress?.totalReadingTime || 0
              }, null, 2)
            }
          ]
        };
      }
    );

    this.server.registerTool(
      "update_reading_progress",
      {
        title: "更新阅读进度",
        description: "更新书籍的阅读进度",
        inputSchema: {
          bookId: z.string().describe("书籍ID"),
          chapterNumber: z.number().min(1).describe("当前章节号"),
          pageNumber: z.number().min(1).describe("当前页码"),
          markChapterCompleted: z.boolean().optional().describe("是否标记章节为已完成")
        },
      },
      async ({ bookId, chapterNumber, pageNumber, markChapterCompleted }) => {
        const book = this.books.get(bookId);
        if (!book) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: "书籍不存在" })
              }
            ]
          };
        }

        let progress = this.readingProgress.get(bookId);
        if (!progress) {
          progress = {
            bookId,
            currentChapter: chapterNumber,
            currentPage: pageNumber,
            completedChapters: [],
            lastReadAt: new Date(),
            totalReadingTime: 0
          };
        } else {
          progress.currentChapter = chapterNumber;
          progress.currentPage = pageNumber;
          progress.lastReadAt = new Date();
        }

        if (markChapterCompleted && !progress.completedChapters.includes(chapterNumber)) {
          progress.completedChapters.push(chapterNumber);
          progress.completedChapters.sort((a, b) => a - b);
        }

        this.readingProgress.set(bookId, progress);

        const completedChapters = progress.completedChapters;
        const totalChapters = book.totalChapters;
        const progressPercentage = (completedChapters.length / totalChapters) * 100;

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                success: true,
                bookId,
                bookTitle: book.title,
                currentChapter: progress.currentChapter,
                currentPage: progress.currentPage,
                completedChapters: completedChapters.length,
                totalChapters,
                progressPercentage: Math.round(progressPercentage),
                message: "阅读进度已更新"
              }, null, 2)
            }
          ]
        };
      }
    );

    this.server.registerTool(
      "get_reading_stats",
      {
        title: "获取阅读统计",
        description: "获取用户的阅读统计数据",
        inputSchema: {
          userId: z.string().optional().describe("用户ID（可选）")
        },
      },
      async ({ userId }) => {
        const totalBooks = this.books.size;
        let completedBooks = 0;
        let totalReadingTime = 0;

        for (const progress of this.readingProgress.values()) {
          const book = this.books.get(progress.bookId);
          if (book && progress.completedChapters.length === book.totalChapters) {
            completedBooks++;
          }
          totalReadingTime += progress.totalReadingTime;
        }

        const stats: ReadingStats = {
          totalBooks,
          completedBooks,
          totalReadingTime,
          currentStreak: Math.floor(Math.random() * 30) + 1
        };

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(stats, null, 2)
            }
          ]
        };
      }
    );
  }

  private setupResources() {
    this.server.addResource({
      name: "book_list",
      description: "所有可用书籍的列表",
      value: Array.from(this.books.values())
    });

    this.server.addResource({
      name: "reading_progress_summary",
      description: "阅读进度摘要",
      value: Array.from(this.readingProgress.entries()).map(([bookId, progress]) => {
        const book = this.books.get(bookId);
        return {
          bookId,
          bookTitle: book?.title,
          currentChapter: progress.currentChapter,
          progress: `${((progress.completedChapters.length / (book?.totalChapters || 1)) * 100).toFixed(1)}%`
        };
      })
    });
  }

  private setupPrompts() {
    this.server.addPrompt({
      name: "reading_recommendation",
      description: "根据阅读历史推荐书籍",
      prompt: "基于我当前的阅读进度和已完成的章节，请为我推荐下一本适合阅读的书籍。考虑以下因素：\n1. 当前正在阅读的书籍和进度\n2. 已完成的章节数量\n3. 书籍的分类和主题\n4. 阅读时间统计"
    });

    this.server.addPrompt({
      name: "reading_summary",
      description: "生成阅读总结",
      prompt: "请为我生成一份阅读总结报告，包括：\n1. 当前阅读的书籍和进度\n2. 已添加的书签和笔记\n3. 阅读统计数据\n4. 阅读建议和改进建议"
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Readbook MCP Server running on stdio");
  }
}

const server = new ReadbookMcpServer();
server.run().catch((error) => {
  console.error("Fatal error starting server:", error);
  process.exit(1);
});
