module.exports = {
    "/verify/{id}": {
        "get": {
            "tags": [
                "Verify"
            ],
            "summary": "verify certificates",
            "description": "",
            "operationId": "verificationId",
            "consumes": [
                "application/json",
                "application/xml"
            ],
            "produces": [
                "application/xml",
                "application/json"
            ],
            "parameters": [
                {
                    "in": "path",
                    "name": "id",
                    "description": "pass verification id",
                    "required": true,
                }
            ],
            "responses": {
                "404": {
                    "description": "Certificate not found"
                },
                "200": {
                    "description": "success"
                }
            },
            "security": [
                {
                    "petstore_auth": [
                        "write:pets",
                        "read:pets"
                    ]
                }
            ]
        },
    },
}