// @ts-ignore
import { z, schema } from '@green-stack/schemas'

/* --- Why? ------------------------------------------------------------------------------------ */

// -i- This is an Expo decoy copy until we figure out why `uuid` doesn't work in Expo
// -i- The real one is in `MockEntity.schema.web.ts` in the same folder

/* --- Schema ---------------------------------------------------------------------------------- */

export const MockDBEntity = schema('MockDBEntity', {
    id: z
        .string()
        .uuid()
        .describe('Provided or auto-generated UUID (V4)'),
    createdAt: z
        .date()
        .default(() => new Date())
        .describe('Creation date'),
    modifiedAt: z
        .date()
        .default(() => new Date())
        .describe('Last modified date'),
})

/* --- Types ----------------------------------------------------------------------------------- */

export type MockDBEntity<
    Z extends z.ZodObject<z.ZodRawShape> = typeof MockDBEntity
> = Prettify<z.input<Z>>
