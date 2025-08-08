import z from "zod";
import { Examples } from "../examples";
import { Drizzle } from "../shared/drizzle";
import { deckTable } from "./deck.sql";
import { and, eq } from "drizzle-orm";
import { fn } from "../shared/fn";
import { createID } from "../shared/id";

export namespace Deck {
    export const InfoSchema = z.
        object({
            success: z.boolean(),
            deck_id: z.string().optional(),
            shuffled: z.boolean(),
            remaining: z.number()
        })
    export const primerDato = z.object({
        deck_count: z.number().min(0).max(1).optional()
    })

    export type InfoType = z.infer<typeof InfoSchema>
    export type primerDatoType = z.infer<typeof primerDato>



    export const example = {
        success: true,
        deck_id: "3p40paa87x90",
        shuffled: true,
        remaining: 52
    }

    function serialize(
        input: typeof deckTable.$inferSelect
    ): InfoType {
        return {
            success: input.success,
            deck_id: input.deck_id,
            shuffled: input.shuffled,
            remaining: input.remaining,
        };
    }

    export const list = async () => {
        const select = Drizzle.db.select().from(deckTable).where(eq(deckTable.isActive, true));
        return (await select).map(serialize);
    };

    // export const create = async () => {

    // };

    export const create = fn(InfoSchema.partial({ deck_id: true }), async (data) => {
        const id = data.deck_id || createID("deck");
        await Drizzle.db.insert(deckTable).values({
            ...data,
            id,
            deck_id: data.deck_id ?? id // garantizamos que siempre haya un deck_id definido 
        });
        return id;
    })

    // export const update = async () => {

    // };


    export const update = fn(InfoSchema, async (data) => {
        await Drizzle.db.update(deckTable)
            .set({ ...data, timeUpdated: new Date() })
            .where(eq(deckTable.deck_id, data.deck_id!)); // el `!` asegura que no sea undefined

        return data.deck_id;
    });



    /*export const getDetail = async () => {

    };*/

    /*export const getDetail = fn(InfoSchema.pick({ deck_id: true }), async ({ deck_id }) => {
        const select = await Drizzle.db.select().from(deckTable).where(
            and(
                eq(deckTable.deck_id, deck_id),
                eq(deckTable.isActive, true)
            )
        )
        return select.map(serialize).at(0)
    });*/


    export const getDetail = fn(InfoSchema.pick({ deck_id: true }).required(), async ({ deck_id }) => {
        console.log("Deck ID recibido:", deck_id); 
        const select = await Drizzle.db.select().from(deckTable).where(
            and(
                eq(deckTable.deck_id, deck_id),
                eq(deckTable.isActive, true)
            )
        );
        return select.map(serialize).at(0);
    }
    );


    // export const deactivate = async () => {

    // };

    export const deactivate = fn(InfoSchema.pick({ deck_id: true }), async ({ deck_id }) => {
          await Drizzle.db.update(deckTable).set({isActive: false,timeDeleted: new Date(),timeUpdated: new Date(),
            })
            .where(eq(deckTable.deck_id, deck_id!));
      
          return deck_id;
        }
      );
      


}


