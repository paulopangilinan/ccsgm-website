'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `\src\app\studio\[[...tool]]\page.tsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '88pu18r5'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-06-02'
import {schema} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'
import {templates} from './src/sanity/templates'
import WpMigrationTool from './src/sanity/tools/WpMigrationTool'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  schema: {
    ...schema,
    templates,
  },
  document: {
    comments: {
      enabled: false,
    },
  },
  plugins: [
    structureTool({structure}),
    visionTool({defaultApiVersion: apiVersion}),
  ],
  tools: [
    {
      name: 'wp-migration',
      title: 'WP Migration',
      component: WpMigrationTool,
    },
  ],
})
