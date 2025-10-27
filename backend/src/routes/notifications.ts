import { Hono } from 'hono';
import { db } from '../db';
import { notifications, users, tweets } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { eq, desc, and } from 'drizzle-orm';

const app = new Hono();

// Get all notifications for current user
app.get('/', authMiddleware, async (c) => {
  const userId = c.get('userId');

  const userNotifications = await db.query.notifications.findMany({
    where: eq(notifications.userId, userId),
    orderBy: [desc(notifications.createdAt)],
    with: {
      actor: {
        columns: {
          password: false,
        },
      },
      tweet: {
        with: {
          user: {
            columns: {
              password: false,
            },
          },
        },
      },
    },
    limit: 50,
  });

  return c.json(userNotifications);
});

// Get unread notification count
app.get('/unread-count', authMiddleware, async (c) => {
  const userId = c.get('userId');

  const count = await db.$count(
    notifications,
    and(eq(notifications.userId, userId), eq(notifications.read, false))
  );

  return c.json({ count });
});

// Mark a notification as read
app.put('/:id/read', authMiddleware, async (c) => {
  const notificationId = parseInt(c.req.param('id'));
  const userId = c.get('userId');

  // Verify notification belongs to user
  const notification = await db.query.notifications.findFirst({
    where: and(
      eq(notifications.id, notificationId),
      eq(notifications.userId, userId)
    ),
  });

  if (!notification) {
    return c.json({ error: 'Notification not found' }, 404);
  }

  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.id, notificationId));

  return c.json({ message: 'Notification marked as read' });
});

// Mark all notifications as read
app.put('/read-all', authMiddleware, async (c) => {
  const userId = c.get('userId');

  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));

  return c.json({ message: 'All notifications marked as read' });
});

export default app;
