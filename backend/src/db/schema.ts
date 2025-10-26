import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

/**
 * ===========================
 * USERS TABLE（ユーザー情報）
 * ===========================
 * - 各ユーザーの基本プロフィールを保持するテーブル
 * - username / email は一意制約
 * - createdAt はデフォルトで現在時刻
 */
export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	username: text('username').notNull().unique(), // 一意なユーザー名
	email: text('email').notNull().unique(), // 一意なメールアドレス
	password: text('password').notNull(), // ハッシュ済みパスワード
	displayName: text('display_name').notNull(), // 表示名
	bio: text('bio'), // 自己紹介文
	avatar: text('avatar'), // アバター画像URL
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()), // 登録日時
});

/**
 * ===========================
 * TWEETS TABLE（投稿）
 * ===========================
 * - 各ユーザーのツイートを保存
 * - userId は users テーブルを参照
 */
export const tweets = sqliteTable('tweets', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	content: text('content').notNull(), // ツイート内容
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }), // ユーザー削除時に関連投稿も削除
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()), // 投稿日時
});

/**
 * ===========================
 * LIKES TABLE（いいね）
 * ===========================
 * - ユーザーがツイートに「いいね」した履歴を管理
 * - userId: 誰が
 * - tweetId: どのツイートに
 */
export const likes = sqliteTable('likes', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }), // ユーザー削除時に関連likeも削除
	tweetId: integer('tweet_id')
		.notNull()
		.references(() => tweets.id, { onDelete: 'cascade' }), // 投稿削除時にlikeも削除
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()), // いいねした日時
});

/**
 * ===========================
 * FOLLOWS TABLE（フォロー関係）
 * ===========================
 * - followerId: フォローする側
 * - followingId: フォローされる側
 * - 同一ユーザー間の重複登録を防ぐ場合は unique 制約を追加してもよい
 */
export const follows = sqliteTable('follows', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	followerId: integer('follower_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }), // フォローする側
	followingId: integer('following_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }), // フォローされる側
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()), // フォロー日時
});

/**
 * ===========================
 * RELATIONS（リレーション定義）
 * ===========================
 * Drizzle ORM の relations() を用いて、双方向の関連を定義
 */

/** User ←→ Tweet / Like / Follow */
export const usersRelations = relations(users, ({ many }) => ({
	tweets: many(tweets), // ユーザーが投稿したツイート
	likes: many(likes), // ユーザーが「いいね」した一覧
	followers: many(follows, { relationName: 'following' }), // このユーザーをフォローしている人
	following: many(follows, { relationName: 'follower' }), // このユーザーがフォローしている人
}));

/** Tweet ←→ User / Like */
export const tweetsRelations = relations(tweets, ({ one, many }) => ({
	user: one(users, {
		fields: [tweets.userId],
		references: [users.id],
	}), // 投稿者情報
	likes: many(likes), // このツイートについたいいね一覧
}));

/** Like ←→ User / Tweet */
export const likesRelations = relations(likes, ({ one }) => ({
	user: one(users, {
		fields: [likes.userId],
		references: [users.id],
	}), // いいねしたユーザー
	tweet: one(tweets, {
		fields: [likes.tweetId],
		references: [tweets.id],
	}), // いいねされたツイート
}));

/** Follow ←→ User */
export const followsRelations = relations(follows, ({ one }) => ({
	follower: one(users, {
		fields: [follows.followerId],
		references: [users.id],
		relationName: 'follower',
	}), // フォローするユーザー
	following: one(users, {
		fields: [follows.followingId],
		references: [users.id],
		relationName: 'following',
	}), // フォローされるユーザー
}));
