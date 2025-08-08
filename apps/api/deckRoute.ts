import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
//import { Deck } from "@blackjack/core"; // Mantenemos esta importación por si usas otras partes de Deck
import { describeRoute } from 'hono-openapi';
import { resolver } from 'hono-openapi/zod';
import z from 'zod';
import { ErrorResponses } from './common';
import { Examples } from '../../core/src/examples';
import { cors } from "hono/cors"

import { Deck } from "../../core";
const responseSchema = Deck.InfoSchema;

export const deckRoute = new Hono()
    .post(
        '/',
        zValidator('json', Deck.primerDato),  
        async (c) => {
            const { deck_count } = c.req.valid("json");
            const response = await fetch(`https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${deck_count ?? 1}`);
            const data = await response.json();

            if (!data.success) {
                return c.json({ error: "No se pudo crear el deck" }, 500);
            }

            const id = await Deck.create({
                success: data.success,
                deck_id: data.deck_id,
                shuffled: data.shuffled,
                remaining: data.remaining,
            });

            return c.json({ data: "ok", id }, 201);
        }
    )
    .get('/',
        describeRoute({
            description: 'Información de baraja',
            responses: {
                200: {
                    description: 'Respuesta exitosa',
                    content: {
                        'application/json': {
                            schema: resolver(
                                z.object({
                                    data: z.array(Deck.InfoSchema)
                                })
                            ),
                            example: {
                                data: [Deck.example]
                            }
                        }
                    }
                },
                400: ErrorResponses[400],
                500: ErrorResponses[500],
            }
        }),

        async (c) => {
            try {
                const decks = await Deck.list();

                return c.json({
                    data: decks,
                }, 200);
            } catch (err) {
                console.error("Error al listar barajas:", err);
                return c.json({ error: "Error al obtener la lista de barajas" }, 500);
            }
        })

    .get("/:deck_id",
        describeRoute({
            tags: ["Deck"],
            summary: "Obtener deck por deck_id",
            description: 'Consultar estado de baraja por identificador ',
            responses: {
                200: {
                    description: 'Respuesta exitosa',
                    content: {
                        'application/json': {
                            schema: resolver(
                                z.object({
                                    data: resolver(Deck.InfoSchema),
                                    example: Examples.Deck
                                })
                            ),
                            example: {
                                data: [Deck.example]
                            }
                        }
                    }
                },
                500: ErrorResponses[500],
            }
        }),

        zValidator("param", Deck.InfoSchema.pick({ deck_id: true })),
        async (c) => {
            const id = c.req.valid("param").deck_id ?? "000000000000";
            const deck = await Deck.getDetail({ deck_id: id });

            if (!deck) {
                return c.json({
                    type: "not_found",
                    code: "resource_not_found",
                    message: "The requested resource could not be found",
                }, 404);
            }
            return c.json({ data: deck }, 200);

        })
    .put(
        "/:deck_id/shuffle",
        describeRoute({
            tags: ["deck"],
            description: "Mezcla una baraja existente por su ID",
            responses: {
                200: {
                    description: "Baraja mezclada exitosamente",
                    content: {
                        "application/json": {
                            schema: resolver(
                                z.object({
                                    success: z.boolean(),
                                    deck_id: z.string(),
                                    remaining: z.number(),
                                    shuffled: z.boolean()
                                })
                            ),
                            example: {
                                success: true,
                                deck_id: "1234abcd",
                                remaining: 52,
                                shuffled: true
                            }
                        }
                    }
                },
                400: ErrorResponses[400],
                500: ErrorResponses[500],
            }
        }),
        zValidator("param", Deck.InfoSchema.pick({ deck_id: true })),
        async (c) => {
            const id = c.req.valid("param").deck_id;

            try {
                const response = await fetch(`https://deckofcardsapi.com/api/deck/${id}/shuffle/`);
                const json = await response.json();

                if (!response.ok || !json.success) {
                    return c.json({ error: "No se pudo mezclar la baraja" }, 400);
                }

                return c.json(json, 200);
            } catch (err) {
                console.error("Error al llamar a la API de mezcla de cartas:", err);
                return c.json({ error: "Error interno al mezclar la baraja" }, 500);
            }
        }
    )


    .patch(
        "/:deck_id/draw",
        describeRoute({
            tags: ["deck"],
            description: "Robar una carta de la baraja por su ID",
            responses: {
                200: {
                    description: "Carta(s) robada(s) exitosamente",
                    content: {
                        "application/json": {},
                    },
                },
                400: ErrorResponses[400],
                500: ErrorResponses[500],
            },
        }),
        zValidator("param", Deck.InfoSchema.pick({ deck_id: true })),
        async (c) => {
            const id = c.req.valid("param").deck_id;

            try {
                const response = await fetch(`https://deckofcardsapi.com/api/deck/${id}/draw/?count=1`);
                const json = await response.json();

                if (!response.ok || !json.success) {
                    return c.json({ error: "No se pudo robar la carta" }, 400);
                }

                return c.json(json, 200);
            } catch (err) {
                console.error("Error al llamar a la API de cartas:", err);
                return c.json({ error: "Error interno al robar la carta" }, 500);
            }
        }
    )


    .delete(
        "/:deck_id",
        describeRoute({
            tags: ["deck"],
            description: 'Eliminar una baraja por su ID (desactivación lógica)',
            responses: {
                204: {
                    description: 'Baraja desactivada exitosamente (sin contenido)',
                },
                400: ErrorResponses[400],
                500: ErrorResponses[500],
            },
        }),
        zValidator("param", Deck.InfoSchema.pick({ deck_id: true })),
        async (c) => {
            const id = c.req.valid("param").deck_id;

            try {
                await Deck.deactivate({ deck_id: id });
                return c.body(null, 204);
            } catch (err) {
                console.error("Error al desactivar la baraja:", err);
                return c.json({ error: "Error interno al desactivar la baraja" }, 500);
            }
        }
    )


