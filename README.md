<h1 align="center">
  Proof of Concept: Feature Toggle
</h1>

<p align="center">
Simple NestJS application to assess the use and feasibility of some feature toggle tools, projects and services.
</p>

<p>
The main branch of this repository has the scaffold and all dependencies used for all the feature toggle services evaluated. To view each feature toggle service usage, switch branches. Details of how to prepare and run the application will be in this README on each branch.
</p>

Services that have been evaluated:
- [Unleash](https://www.getunleash.io/)
- [Split](https://www.split.io/)
- [LaunchDarkly](https://launchdarkly.com/)

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
    - Depending on the service, an `off` variant may also be needed. Its weight is 0% and its payload is: `{ "engines": null }`.

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

### \<Service\> setup

Guidance is given in this README on each branch.

### API setup

#### Get the code

Clone this repo, fetch and switch to the desired branch.

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

Fill in `.env` according to the directions in the README for each branch.

#### Start the API

```shell
npm run start:dev
```

The API will be available at [http://localhost:3000](http://localhost:3000).

You can now play around with the flag states in the Unleash admin and call the [routes](#routes) from this API.

## License

[MIT](LICENSE)
