import { pgTable, varchar, text, boolean, integer } from "drizzle-orm/pg-core";
import { Drizzle } from "../shared/drizzle";

export const deckTable = pgTable("deck", {

  ...Drizzle.id,
  ...Drizzle.timestamps,
  ...Drizzle.isActive,

  success: boolean ("success").notNull(),
  deck_id: varchar("deck_id", { length: 20 }).notNull(),
  shuffled: boolean("shuffled").notNull(),
  remaining: integer ("remaining").notNull(),
});