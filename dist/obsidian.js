"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookExists = bookExists;
exports.writeBook = writeBook;
exports.bookToMarkdown = bookToMarkdown;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const BOOKS_DIR = process.env.VAULT_PATH;
function sanitizeFilename(name) {
    return name
        .replace(/[<>:"/\\|?*]/g, "-")
        .replace(/\s+$/g, "")
        .replace(/\.+$/g, "");
}
function bookExists(book) {
    if (!fs_1.default.existsSync(BOOKS_DIR))
        return false;
    const files = fs_1.default.readdirSync(BOOKS_DIR);
    return files.some((file) => file.includes(book.googleBooksId));
}
function writeBook(book, content) {
    const filename = sanitizeFilename(book.title);
    const filePath = path_1.default.join(BOOKS_DIR, `${filename}.md`);
    fs_1.default.writeFileSync(filePath, content, "utf8");
}
function bookToMarkdown(book) {
    const authors = book.authors.map((a) => `  - "[[${a}]]"`).join("\n");
    return `---
Title: ${book.title}
Authors:
${authors}
Read: ${book.status ?? false}
Rating: ${book.rating ?? ""}
Date Read: ${book.dateRead ?? ""}
Pages: ${book.pages ?? ""}
Published: ${book.publishedYear ?? ""}
isbn13: ${book.isbn13 ?? ""}
coverUrl: ${book.imageLinks?.thumbnail ?? book.imageLinks?.smallThumbnail ?? undefined}
---
`;
}
