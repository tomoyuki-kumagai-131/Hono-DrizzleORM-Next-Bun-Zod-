import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { users } from '../db/schema';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { eq } from 'drizzle-orm';

const app = new Hono();

const signupSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(1).max(50),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

app.post('/signup', async (c) => {
  try {
    const body = await c.req.json();
    const data = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { or, eq }) =>
        or(eq(users.email, data.email), eq(users.username, data.username)),
    });

    if (existingUser) {
      return c.json({ error: 'User already exists' }, 400);
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(data.password);
    const [newUser] = await db.insert(users).values({
      username: data.username,
      email: data.email,
      password: hashedPassword,
      displayName: data.displayName,
    }).returning();

    const token = generateToken(newUser.id);

    return c.json({
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        displayName: newUser.displayName,
        bio: newUser.bio,
        avatar: newUser.avatar,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.errors }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const data = loginSchema.parse(body);

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Verify password
    const isValid = await comparePassword(data.password, user.password);
    if (!isValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const token = generateToken(user.id);

    return c.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.errors }, 400);
    }
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;
