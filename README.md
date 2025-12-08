# Readbook MCP Server

A Model Context Protocol (MCP) server for reading books, transformed from the Telegram Mini App readbook project.

## Features

This MCP server provides the following tools for AI assistants to help with reading:

### Tools

- **`search_books`** - Search for books by title, author, or category
- **`get_book_content`** - Get chapter content of a specific book
- **`add_bookmark`** - Add a bookmark at a specific location
- **`get_bookmarks`** - Get all bookmarks for a book
- **`get_reading_progress`** - Get reading progress for a book
- **`update_reading_progress`** - Update reading progress
- **`get_reading_stats`** - Get overall reading statistics

### Resources

- **`book_list`** - List of all available books
- **`reading_progress_summary`** - Summary of reading progress across all books

### Prompts

- **`reading_recommendation`** - Get personalized book recommendations
- **`reading_summary`** - Generate a reading summary report

## Installation

### From Source

1. Clone the repository:
```bash
git clone https://github.com/yourusername/readbook-mcp.git
cd readbook-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Configuration

### Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "readbook": {
      "command": "node",
      "args": ["/path/to/readbook-mcp/build/index.js"]
    }
  }
}
```

### Cursor

Add to your `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "readbook": {
      "command": "node",
      "args": ["/path/to/readbook-mcp/build/index.js"]
    }
  }
}
```

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

### Test with MCP Inspector

```bash
npm run inspector
```

## Mock Data

The server comes with pre-loaded mock books:

- **JavaScript高级程序设计** by Nicholas C. Zakas (25 chapters)
- **人类简史** by 尤瓦尔·赫拉利 (20 chapters)
- **百年孤独** by 加西亚·马尔克斯 (20 chapters)

## API Usage Examples

### Search Books

```javascript
// Search by title
await client.callTool({
  name: "search_books",
  arguments: {
    query: "JavaScript",
    searchType: "title"
  }
});

// Search by author
await client.callTool({
  name: "search_books",
  arguments: {
    query: "Nicholas",
    searchType: "author"
  }
});
```

### Get Book Content

```javascript
await client.callTool({
  name: "get_book_content",
  arguments: {
    bookId: "book_001",
    chapterNumber: 1
  }
});
```

### Add Bookmark

```javascript
await client.callTool({
  name: "add_bookmark",
  arguments: {
    bookId: "book_001",
    chapterNumber: 3,
    pageNumber: 15,
    note: "Important concept about closures"
  }
});
```

### Update Reading Progress

```javascript
await client.callTool({
  name: "update_reading_progress",
  arguments: {
    bookId: "book_001",
    chapterNumber: 5,
    pageNumber: 23,
    markChapterCompleted: true
  }
});
```

## Architecture

This MCP server is built using:

- **@modelcontextprotocol/sdk** - Official MCP TypeScript SDK
- **TypeScript** - Type-safe development
- **Zod** - Schema validation
- **Stdio transport** - Standard input/output communication

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
