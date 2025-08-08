import {ApiType} from "../../api";
const {hc} = require("hono/dist/client") as typeof import("hono/client");

export const client = hc<ApiType>("http://localhost:3001");
