export class ApiError extends Error {
  status: number;
  url: string;
  data: unknown;

  constructor(params: { status: number; url: string; message: string; data: unknown }) {
    super(params.message);
    this.name = 'ApiError';
    this.status = params.status;
    this.url = params.url;
    this.data = params.data;
  }
}

