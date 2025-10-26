import { Hono } from 'hono';
import { z } from 'zod';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { db } from '../db';
import { users } from '../db/schema';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { eq } from 'drizzle-orm';

const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const googleJWKS = createRemoteJWKSet(new URL(GOOGLE_JWKS_URL));

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

    const token = await generateToken(newUser.id);

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

    const token = await generateToken(user.id);

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

const googleAuthSchema = z.object({
  credential: z.string(),
});

app.post('/google', async (c) => {
  try {
    const body = await c.req.json();
    const data = googleAuthSchema.parse(body);

    console.log('Received credential:', data.credential);
    console.log('Credential type:', typeof data.credential);
    console.log('Credential length:', data.credential?.length);

    if (!data.credential || typeof data.credential !== 'string' || data.credential.trim() === '') {
      return c.json({ error: 'Invalid or empty credential' }, 400);
    }

    // Verify Google ID token
    const { payload } = await jwtVerify(data.credential, googleJWKS, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    if (!payload || !payload.email) {
      return c.json({ error: 'Invalid Google token' }, 401);
    }

    const email = payload.email as string;
    const name = payload.name as string | undefined;
    const picture = payload.picture as string | undefined;

    // Check if user exists
    let user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    // Create user if doesn't exist
    if (!user) {
      // Generate username from email
      let username = email.split('@')[0];

      // Check if username already exists
      let usernameExists = await db.query.users.findFirst({
        where: eq(users.username, username),
      });

      // Add random number if username exists
      let counter = 1;
      while (usernameExists) {
        username = `${email.split('@')[0]}${counter}`;
        usernameExists = await db.query.users.findFirst({
          where: eq(users.username, username),
        });
        counter++;
      }

      // Create user with random password (won't be used for Google auth)
      const randomPassword = await hashPassword(Math.random().toString(36));

      const [newUser] = await db.insert(users).values({
        username,
        email,
        password: randomPassword,
        displayName: name || email.split('@')[0],
        avatar: picture,
      }).returning();

      user = newUser;
    }

    const token = await generateToken(user.id);

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
    console.error('Google auth error:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.errors }, 400);
    }
    return c.json({ error: 'Google authentication failed' }, 500);
  }
});

export default app;
