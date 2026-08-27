import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  text,
  boolean,
  unique,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  age: integer("age").notNull(),
  gender: varchar("gender", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 30 }).notNull().default(""),
  passwordHash: text("password_hash").notNull(),
  bio: text("bio").default(""),
  location: varchar("location", { length: 120 }).default(""),
  tier: varchar("tier", { length: 20 }).notNull().default("free"), // free | plus | vip
  // When a paid plan runs out. Null for free members / no active plan.
  tierExpiresAt: timestamp("tier_expires_at"),
  messagesUsed: integer("messages_used").notNull().default(0),
  isAdmin: boolean("is_admin").notNull().default(false),
  isBanned: boolean("is_banned").notNull().default(false),
  emailVerifiedAt: timestamp("email_verified_at"),
  // Manual phone-call identity check, done by an admin. We deliberately do
  // NOT store NID numbers or ID document images/scans anywhere in this
  // system - verification happens by phone call, and only the outcome
  // (status/who/when) is recorded here.
  identityStatus: varchar("identity_status", { length: 20 }).notNull().default("pending"), // pending | verified | rejected
  identityVerifiedAt: timestamp("identity_verified_at"),
  identityVerifiedByUserId: integer("identity_verified_by_user_id").references((): AnyPgColumn => users.id),
  // "self" = normal signup. "admin" = admin created this profile on behalf
  // of a real person who already has a paying relationship with us (per
  // business decision - not for impersonating public figures).
  profileSource: varchar("profile_source", { length: 20 }).notNull().default("self"),
  adminCategory: varchar("admin_category", { length: 30 }), // legacy: model | influencer | other
  // Which homepage category this profile belongs to. Drives the
  // "Who you will meet here" browse filters. Null = uncategorised.
  category: varchar("category", { length: 40 }),
  adminNote: text("admin_note").default(""), // internal note, e.g. how/when they paid
  // Admin-created profiles start unpublished (draft) until an admin
  // flips them live. Self-signups are published immediately.
  isPublished: boolean("is_published").notNull().default(true),
  // When a VIP's "spotlight" boost expires. Null = not currently spotlighted.
  spotlightUntil: timestamp("spotlight_until"),
  // Refreshed as the member uses the site; drives the "Online now" /
  // "Active 5m ago" indicator on profiles.
  lastSeenAt: timestamp("last_seen_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // Object key inside the R2 bucket, e.g. "users/12/photo-<uuid>.jpg"
  key: varchar("key", { length: 500 }).notNull(),
  // What the photo is FOR: "profile" (avatar), "cover" (banner) or "album".
  // Before this column existed the role was inferred from position - photo 0
  // was the avatar, photo 1 the cover - so uploading in the wrong order
  // silently changed someone's avatar. At most one profile and one cover row
  // per user; uploading a new one replaces the old.
  role: varchar("role", { length: 10 }).notNull().default("album"),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const likes = pgTable(
  "likes",
  {
    id: serial("id").primaryKey(),
    fromUserId: integer("from_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    toUserId: integer("to_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // true = liked, false = passed. Both are recorded so a passed
    // profile isn't shown again in the browse feed.
    liked: boolean("liked").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [unique().on(table.fromUserId, table.toUserId)]
);

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  toUserId: integer("to_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Homepage hero slides, editable from the admin panel. */
export const slides = pgTable("slides", {
  id: serial("id").primaryKey(),
  // Object key inside the R2 bucket, e.g. "slides/<uuid>.jpg"
  imageKey: varchar("image_key", { length: 500 }).notNull(),
  eyebrow: varchar("eyebrow", { length: 120 }).default(""),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").default(""),
  ctaLabel: varchar("cta_label", { length: 60 }).default("Create free profile"),
  ctaHref: varchar("cta_href", { length: 200 }).default("/register"),
  position: integer("position").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * One row per profile a member opens. Distinct profiles seen in the current
 * calendar month are what count against the free "profile visits" allowance,
 * so re-opening the same profile is free.
 */
export const profileViews = pgTable("profile_views", {
  id: serial("id").primaryKey(),
  viewerUserId: integer("viewer_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  viewedUserId: integer("viewed_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const paymentRequests = pgTable("payment_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tier: varchar("tier", { length: 20 }).notNull(), // plus | vip
  amount: integer("amount").notNull(), // BDT, whole taka
  method: varchar("method", { length: 20 }).notNull(), // bkash | nagad
  senderNumber: varchar("sender_number", { length: 30 }).notNull(),
  transactionId: varchar("transaction_id", { length: 60 }).notNull().unique(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending | approved | rejected
  adminNote: text("admin_note").default(""),
  reviewedByUserId: integer("reviewed_by_user_id").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Used for both "reset password" and "verify email" links. purpose keeps
// them apart; token is a random opaque string, never guessable.
export const verificationTokens = pgTable("verification_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 64 }).notNull().unique(),
  purpose: varchar("purpose", { length: 20 }).notNull(), // reset | verify
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const blocks = pgTable(
  "blocks",
  {
    id: serial("id").primaryKey(),
    blockerUserId: integer("blocker_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    blockedUserId: integer("blocked_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [unique().on(table.blockerUserId, table.blockedUserId)]
);

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterUserId: integer("reporter_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reportedUserId: integer("reported_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reason: varchar("reason", { length: 40 }).notNull(),
  details: text("details").default(""),
  status: varchar("status", { length: 20 }).notNull().default("open"), // open | reviewed | dismissed
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Photo = typeof photos.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type Block = typeof blocks.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type Slide = typeof slides.$inferSelect;
