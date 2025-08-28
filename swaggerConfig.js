const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Dog Adoption API',
            version: '1.0.0',
            description: 'A RESTful API for a dog adoption platform.',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
    },
    apis: ['./routes/*.js', './models/*.js'], // Files to parse for API documentation
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
