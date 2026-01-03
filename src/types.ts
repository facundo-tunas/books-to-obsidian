export interface Book {
  title: string;
  subtitle?: string;
  authors: string[];
  publishedYear?: number;
  pages?: number;
  isbn13?: string;
  categories: string[];
  description?: string;
  googleBooksId: string;
  rating?: number;
  dateRead?: string;
  status?: boolean
  imageLinks?: ImageLinks;
}

type ImageLinks = {
  thumbnail?: string,
  smallThumbnail?: string
}
