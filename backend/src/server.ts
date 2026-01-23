import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import cors, { type CorsOptions } from 'cors';
import { randomUUID } from 'crypto';

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

const parseOrigins = (value?: string): string[] =>
  value
    ?.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0) ?? [];

const allowedOrigins = parseOrigins(process.env.ALLOWED_ORIGINS);

const corsConfig: CorsOptions = {
  origin(requestOrigin, callback) {
    if (!requestOrigin || allowedOrigins.length === 0 || allowedOrigins.includes(requestOrigin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin not allowed')); // Origin rejected to preserve Zero Trust posture
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  exposedHeaders: ['x-request-id'],
  maxAge: 600,
};

app.use(cors(corsConfig));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

export type RequestContext = {
  requestId: string;
  startedAt: number;
};

type RequestWithContext = Request & {
  context?: RequestContext;
};

app.use((req: RequestWithContext, res: Response, next: NextFunction) => {
  const requestId = req.header('x-request-id') ?? randomUUID();
  req.context = { requestId, startedAt: Date.now() };
  res.setHeader('x-request-id', requestId);
  next();
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Warp Reporting API is operational',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

class HttpError extends Error {
  public readonly statusCode: number;
  public readonly expose: boolean;

  constructor(statusCode: number, message: string, expose = statusCode < 500) {
    super(message);
    this.statusCode = statusCode;
    this.expose = expose;
  }
}

app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new HttpError(404, `Route ${req.method} ${req.originalUrl} not found`));
});

app.use((error: unknown, req: RequestWithContext, res: Response, _next: NextFunction) => {
  const referenceId = req.context?.requestId ?? randomUUID();
  const normalizedError =
    error instanceof HttpError ? error : new HttpError(500, 'Internal server error', false);

  if (!normalizedError.expose) {
    console.error(`[${referenceId}] Unexpected error`, error);
  }

  res.status(normalizedError.statusCode).json({
    error: {
      message: normalizedError.expose ? normalizedError.message : 'Internal server error',
      referenceId,
    },
  });
});

const port = Number.parseInt(process.env.PORT ?? '8080', 10);
const host = process.env.HOST ?? '0.0.0.0';

const server = app.listen(port, host, () => {
  console.info(`Warp Reporting API listening on http://${host}:${port}`);
});

const gracefulShutdown = (signal: NodeJS.Signals) => {
  console.info(`Received ${signal}. Shutting down Warp Reporting API gracefully.`);
  server.close(() => {
    console.info('HTTP server closed.');
    process.exit(0);
  });
};

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal as NodeJS.Signals, () => gracefulShutdown(signal as NodeJS.Signals));
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection detected', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception detected', error);
  process.exit(1);
});
