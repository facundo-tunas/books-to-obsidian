"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookToMarkdown = bookToMarkdown;
function bookToMarkdown(book) {
    const authors = book.authors.map((a) => `  - "[[${a}]]"`).join("\n");
    console.log(book);
    return `---
title: ${book.title}
authors:
${authors}
read: ${book.status ?? false}
rating: ${book.rating ?? ""}
date_read: ${book.dateRead ?? ""}
pages: ${book.pages ?? ""}
published: ${book.publishedYear ?? ""}
isbn13: ${book.isbn13 ?? ""}
coverUrl: ${book.imageLinks?.thumbnail ??
        book.imageLinks?.smallThumbnail ??
        undefined}
---
`;
}
