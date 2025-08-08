import { prefixes } from "../shared/id";

export namespace Examples {
    export const Id = (prefix: keyof typeof prefixes) =>
        `${prefixes[prefix]}_XXXXXXXXXXXXXXXXXXXXXXXXX`;


    export const Deck = {
        success: true,
        deck_id: "3p40paa87x90",
        shuffled: true,
        remaining: 52,
      } 
      

}