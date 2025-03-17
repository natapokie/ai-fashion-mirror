import dotenv from 'dotenv';
import path from 'path';
import { Express } from 'express';
import swaggerJSDoc, { Options } from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

export const swaggerLoader = (app: Express) => {
  const swaggerOptions: Options = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        version: 'v1.0.0',
        title: 'AI Fashion Mirror API',
        description: '',
      },
      servers: [
        {
          url: `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}`,
          description: 'Development Server',
        },
      ],
    },
    apis: [path.resolve(__dirname, '../routes/*.ts'), path.resolve(__dirname, './components.yml')],
  };

  const swaggerDocs = swaggerJSDoc(swaggerOptions);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};
