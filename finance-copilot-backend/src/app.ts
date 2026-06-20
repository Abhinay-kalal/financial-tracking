import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import router from './routes';
import { errorHandler } from './middlewares/error';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // Customize to React/Next.js client origin in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom Inline Cookie Parser Middleware (removes need for external cookie-parser dependency)
app.use((req: any, _res, next) => {
  const cookieHeader = req.headers.cookie;
  req.cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie: string) => {
      const [key, ...valParts] = cookie.split('=');
      const val = valParts.join('=');
      req.cookies[key.trim()] = decodeURIComponent((val || '').trim());
    });
  }
  next();
});

// Swagger Specification Setup
const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Copilot API Documentation',
      version: '1.0.0',
      description: 'Comprehensive REST APIs managing GST invoicing, cash ledgers, receivables, payables, and reports.',
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [], // We define schema inline or via routes
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Base route redirection to /docs
app.get('/', (_req: Request, res: Response) => {
  res.redirect('/docs');
});

// API Routes mounting
app.use('/api', router);

// Error Handling Middleware
app.use(errorHandler);

export default app;
