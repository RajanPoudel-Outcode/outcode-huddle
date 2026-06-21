import express, { Router } from 'express';
import { openapiSpec } from './openapi';

const router: Router = express.Router();

// Swagger UI is loaded from a CDN so no extra npm dependency is required.
const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>E-commerce API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = function () {
        window.ui = SwaggerUIBundle({
          url: '/api/docs.json',
          dom_id: '#swagger-ui',
          deepLinking: true,
          persistAuthorization: true,
        });
      };
    </script>
  </body>
</html>`;

// Raw OpenAPI document (sent directly so the global response wrapper doesn't touch it)
router.get('/docs.json', (_req, res) => {
  res.type('application/json').send(JSON.stringify(openapiSpec));
});

// Swagger UI page
router.get('/docs', (_req, res) => {
  res.type('html').send(html);
});

export default router;
