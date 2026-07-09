import { postType } from "./post";
import { sermonSettingsType } from "./sermonSettings";
import { pageContentType } from "./pageContent";
import { missionType } from "./mission";
import { programType } from "./program";
import { projectType } from "./project";
import { aboutPageType } from "./aboutPage";
import { locationsPageType } from "./locationsPage";
import { siteSettingsType } from "./siteSettings";
import { blogCategoryType } from "./blogCategory";
import { homePageType } from "./homePage";
import { givePageType } from "./givePage";
import { contactPageType } from "./contactPage";

export const schemaTypes = [postType, sermonSettingsType, pageContentType, missionType, programType, projectType, aboutPageType, locationsPageType, siteSettingsType, blogCategoryType, homePageType, givePageType, contactPageType];

export const schema = {
  types: schemaTypes,
};
