<h1 align="center">
  Proof of Concept: Unleash (Node.js client)
</h1>

<div align="center">
Simple NestJS application to assess the use and feasibility of some feature toggle tools, projects and services.

This POC uses [Unleash](https://www.getunleash.io/) and its [Node.js client](https://github.com/Unleash/unleash-client-node).
</div>

## Project description

The application is a very simple API with 4 routes listing features and configuration, whose responses are changed according to a few feature flags.

### Toggles:

- `pixEnabled`: on/off switch that enables Pix as a payment method. This flag has a constraint that limits Pix to an allowlist of user IDs (in this case: stores).
  - Valid user IDs: `0123`, `4567`, `8901`.
- `freePlanEnabled`: on/off switch that lists a free plan option globally. There are no constraints.
- `antiFraudEnabled`: on/off switch to anti-fraud protection globally. No other constraints.
  - This flag can be used to return a response stating that anti-fraud protection is disabled or return a 404 response for a route.
- `antiFraudEngine`: flag with sets of anti-fraud engines with different weights/distributions.
  - > Usage of this toggle depends on the availability of multivariate functionality in each feature toggle vendor/project.
  - Variants and its weights and payloads in JSON format:
    - `clearsale` (55%): `{ "engines": ["clearsale"] }`
    - `allEngines` (20%): `{ "engines": ["clearsale", "legiti", "konduto"] }`
    - `legiti` (10%): `{ "engines": ["legiti"] }`
    - `konduto` (15%): `{ "engines": ["konduto"] }`

### Routes

#### GET /plans

Returns all available plans: `free`, `startup`, `pro` and `enterprise`.

The `free` plan depends on the `freePlanEnabled` flag. If it is off, the `free` plan must not be present in the response.

#### GET /payment-methods

Returns all available payment methods: `creditCard`, `slip` and `pix`.

`pix` depends on the `pixEnabled` and is restricted to the following user IDs ("stores"): `0123`, `4567`, `8901`.

The user ID can be specified by the storeId parameter in the query string: `GET /payment-methods?storeId=0123`

#### GET /anti-fraud

Returns the state of the anti-fraud protection and available enabled engines: `clearsale`, `legiti`, `konduto`.

This route depends on the `antiFraudEnabled` flag. If it is off, the response must either state that anti-fraud is disabled, or return 404.

The available engines to be shown also depend on a flag: `antiFraudEngine` and its variants.

No context is passed, so the listed/returned engines will be selected randomly considering their distribution weight (see [Toggles](#toggles)).


#### GET /features

Returns an object with data of all routes above.

----

## Project setup

### Unleash setup

#### Running the server

Follow the [Quickstart](https://docs.getunleash.io/user_guide/quickstart) instructions in the documentation.

If you decided to run the server locally with Docker, follow the instructions in [this section](https://docs.getunleash.io/deploy/getting_started#option-two---use-docker-compose). **Before** running `docker-compose build` and `docker-compose up`, run inside the server repo you cloned:
```shell
npm install unleash-server@4.2.0
```
This will install the latest release of Unleash as the dockerized server repo has not yet been updated.

#### Flag registration

With the Unleash server up and running, access the [admin](http://localhost:4242) using the [default credentials](https://docs.getunleash.io/user_guide/quickstart#accessing-your-new-instance-1).

Create the flags indicated in [Toggles section](#toggles), following the instructions in the articles [Create a Feature Toggle](https://docs.getunleash.io/user_guide/create_feature_toggle),  [Activation Stategies](https://docs.getunleash.io/user_guide/activation_strategy) and [Toggle Variants](https://docs.getunleash.io/advanced/toggle_variants) from the Unleash documentation:

- For common flags (on/off switch), simply assign a key/name, choose the type you want (some types have duration/validity, you can read more [here](https://docs.getunleash.io/advanced/feature_toggle_types)) and click "Create".
- For flags with allowlists, click "Add Strategy" in the creation form, then click "Configure" in the "UserIDs" card. Insert the allowed IDs, click "Save" in the modal and then click "Create".
- For flags with variants, create the flag normally and you'll be redirected to the flag page. Go to the "Variants" tab and register the needed variants inserting the key/name, payload and weight for each variant.
  - The first variant cannot have a weight. Its weight will be adjusted as other variants are registered.

#### Create an API token

Follow the instructions in [API Tokens](https://docs.getunleash.io/user_guide/api-token). Create the token with type `Client` and whatever username you want to assign. The username is only used to identify the token.

Copy the token as it will be used next.


### API setup

#### Get the code

Clone this repo, fetch and switch to the `unleash` branch.

#### Install

> Dependencies are the same across **all** branches. Once installed in any of the branches, this step can be skipped.

```shell
npm run install
```


#### Set the environment variables

At the project root, create a copy of the `.env.example` file as `.env`

```shell
cp .env.example .env
```

Fill in `.env` accordingly:

- `APP_NAME`: the name of the application. It can be left untouched using the value already assigned to this variable. Most PoCs in this repo interpolate this name with the name of the service being tested. **Default:** `feature-toggle-poc`.
- `APP_ENV`: app environment. Service environment. It may be necessary if the service used in the plan has the functionality of multiple environments. **Default:** `default`.
- `UNLEASH_API_URL`: Unleash API URL. It can be left unchanged if the Unleash server is running locally with Docker. **Default:** `http://localhost:4242/api/`.
- `UNLEASH_API_KEY`: API token for client access, generated in [Create an API token](#create-an-api-token).


#### Start the API

```shell
npm run start:dev
```

The API will be available at [http://localhost:3000](http://localhost:3000).

You can now play around with the flag states in the Unleash admin and call the [routes](#routes) from this API.

## License

[MIT](LICENSE)
