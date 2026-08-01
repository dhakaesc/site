import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  text,
  boolean,
  unique,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  age: integer("age").notNull(),
  gender: varchar("gender", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  bio: text("bio").default(""),
  location: varchar("location", { length: 120 }).default(""),
  tier: varchar("tier", { length: 20 }).notNull().default("free"), // free | plus | vip
  // When a paid plan runs out. Null for free members / no active plan.
  tierExpiresAt: timestamp("tier_expires_at"),
  messagesUsed: integer("messages_used").notNull().default(0),
  isAdmin: boolean("is_admin").notNull().default(false),
  isBanned: boolean("is_banned").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // Object key inside the R2 bucket, e.g. "users/12/photo-<uuid>.jpg"
  key: varchar("key", { length: 500 }).notNull(),
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

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Photo = typeof photos.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type PaymentRequest = typeof paymentRequests.$inferSelect;
