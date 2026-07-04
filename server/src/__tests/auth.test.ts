import request from 'supertest';
import express from 'express';
import authRouter from '../routes/authRoutes';
import { globalErrorHandler } from '../middleware/errorMiddleware';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use(globalErrorHandler);

describe('Authentication API Endpoint Hardening', () => {
  it('should prevent registration with invalid email formats', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid-email',
        password: 'securePassword123',
        name: 'John Doe'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('should prevent registration with short passwords', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'john@example.com',
        password: '123',
        name: 'John Doe'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('fail');
  });
});
