import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configure la documentation interactive Swagger UI sur la route /docs
 */
export async function setupDocs(app: Router): Promise<void> {
  try {
    const yamlPath = join(__dirname, '../../../docs/openapi.yaml');
    const yamlContent = await readFile(yamlPath, 'utf-8');
    const swaggerDoc = yaml.parse(yamlContent);

    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
    console.log('[product] Documentation OpenAPI disponible sur /docs');
  } catch (err) {
    console.warn('[product] Impossible de charger openapi.yaml pour /docs:', err);
  }
}
