import { postType } from "./post";
import { sermonSettingsType } from "./sermonSettings";
import { pageContentType } from "./pageContent";
import { missionType } from "./mission";
import { programType } from "./program";
import { projectType } from "./project";

export const schemaTypes = [postType, sermonSettingsType, pageContentType, missionType, programType, projectType];

export const schema = {
  types: schemaTypes,
};
