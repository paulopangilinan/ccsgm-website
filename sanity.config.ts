'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `\src\app\studio\[[...tool]]\page.tsx` route
 */

import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '88pu18r5'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
import {schema} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'
import {templates} from './src/sanity/templates'
import WpMigrationTool from './src/sanity/tools/WpMigrationTool'
import StudioNavbar from './src/sanity/components/StudioNavbar'

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
  studio: {
    components: {
      navbar: StudioNavbar,
    },
  },
  releases: {
    enabled: false,
  },
  scheduledDrafts: {
    enabled: false,
  },
  plugins: [structureTool({structure})],
  // The WP Migration tool calls this app's own /api/migrate/* routes, which
  // only exist when Studio is embedded in the Next.js app — not in the
  // standalone Studio deployed via `sanity deploy` (ccsgm.sanity.studio).
  // NEXT_PUBLIC_* is inlined by Next.js's bundler but ignored by the Sanity
  // CLI's bundler (which only inlines SANITY_STUDIO_*), so this flag is only
  // ever true in the Next.js-embedded build — no env setup needed on the
  // standalone deploy side.
  tools: (prev) =>
    process.env.NEXT_PUBLIC_SANITY_STUDIO_EMBEDDED === 'true'
      ? [
          ...prev,
          {
            name: 'wp-migration',
            title: 'WordPress Migration',
            component: WpMigrationTool,
          },
        ]
      : prev,
})
