A TypeScript tool to fetch book metadata from Google Books API and create Obsidian notes in your vault.

# HOW TO USE :)

## 1. Configure Environment Variables
Create a .env file in the project root:
``` bash
VAULT_PATH=/path/to/your/obsidian/vault/Books
CSV_PATH=/path/to/your/goodreads_library_export.csv # optional
```
- **VAULT_PATH**: Path to the desired folder in Obsidian.
- **CSV_PATH**: (If using Goodreads Export) Path to the CSV file.

## 2a. Manual Searching
1. Search for and add a single book interactively:
    ``` bash
    npm run fetch "The Great Gatsby"
    ```

2. Choose the correct book (Input from 1 to 5).

## 2b. Goodreads Export
1. Export your library from Goodreads (Library → Import/Export → Export)
2. Update CSV_PATH in your .env file
3. Install dependencies using ```npm install```
4. Run command:
    ``` bash
    npm run import:goodreads
    ```
