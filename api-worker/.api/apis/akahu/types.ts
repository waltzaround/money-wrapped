import type { FromSchema } from 'json-schema-to-ts';
import * as schemas from './schemas';

export type GenieSearchBodyParam = FromSchema<typeof schemas.GenieSearch.body>;
export type GenieSearchResponse200 = FromSchema<typeof schemas.GenieSearch.response['200']>;
export type GenieSearchResponse400 = FromSchema<typeof schemas.GenieSearch.response['400']>;
export type GenieSearchResponse401 = FromSchema<typeof schemas.GenieSearch.response['401']>;
export type GenieSearchResponse403 = FromSchema<typeof schemas.GenieSearch.response['403']>;
export type GenieSearchResponse429 = FromSchema<typeof schemas.GenieSearch.response['429']>;
export type GenieSearchResponse500 = FromSchema<typeof schemas.GenieSearch.response['500']>;
