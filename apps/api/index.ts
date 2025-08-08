import { Hono } from 'hono'
import { deckRoute } from './deckRoute';
import { openAPISpecs } from 'hono-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import { cors } from "hono/cors"

const app = new Hono();
const route = app.use('*', cors({
    origin: '*', // Puedes cambiar esto por la URL de tu frontend si deseas restringirlo
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowHeaders: ['Content-Type'],
}))
    .route("/api/decks", deckRoute)
    .get(
        '/openapi',
        openAPISpecs(app, {
            documentation: {
                info: {
                    title: 'Hono API',
                    version: '1.0.0',
                    description: 'Greeting API',
                },
                servers: [
                    { url: 'http://localhost:3001', description: 'Local Server' },
                ],
            },
        })
    )
    .get(
        '/docs',
        Scalar({
            theme: 'saturn',
            url: '/openapi'
        }))

export type ApiType = typeof route;
export default {
    port: 3001,
    fetch: app.fetch,
}