import { postType } from "./post";
import { sermonSettingsType } from "./sermonSettings";

export const schemaTypes = [postType, sermonSettingsType];

export const schema = {
  types: schemaTypes,
};
