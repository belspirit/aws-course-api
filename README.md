# aws-course-api

API for the Lambda on course "NodeJS for AWS" from The Rolling Scopes School

## What was done?

Frontend application is integrated with product service (/products API) and products from product-service are represented on Frontend. AND POINT1 and POINT2 are done.

## Additional scope:

- +1 - Async/await is used in lambda functions
- +1 - ES6 modules are used for product-service implementation
- +1 - Webpack is configured for product-service
- 0 - SWAGGER documentation is created for product-service
- +1 - Lambda handlers are covered by basic UNIT tests (NO infrastructure logic is needed to be covered)
- +1 - Lambda handlers (getProductsList, getProductsById) code is written not in 1 single module (file) and separated in codebase.
- +1 - Main error scenarious are handled by API ("Product not found" error).

Link to product-service API: https://n4w7ktp7nk.execute-api.us-east-1.amazonaws.com/products

LInk to FE MR (YOUR OWN REPOSITORY): https://github.com/belspirit/shop-react-redux-cloudfront/pulls

SWAGGER - in progress

### Get all products:

GET https://n4w7ktp7nk.execute-api.us-east-1.amazonaws.com/products

### Get product by ID:

GET https://n4w7ktp7nk.execute-api.us-east-1.amazonaws.com/products/{id}
