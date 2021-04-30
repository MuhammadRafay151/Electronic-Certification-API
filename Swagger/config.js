const docs = require("./docs")
module.exports = {
    swaggerDocument: {
        openapi: '3.0.1',
        info: {
            version: '1.0.0',
            title: 'ECERT API',
            description: '',
            termsOfService: '',
            contact: {
                name: 'Muhammad Rafay',
                email: 'muhammadrafay151@gmail.com',
                url: 'https://mrafay.tk'
            },
            license: {
                name: 'Apache 2.0',
                url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
            }
        },
        host: "localhost:8000",
        "servers": [
            
            {
              "url": "/api",
              "description": "Development server"
            },
           
          ],
        paths: docs

    }
}