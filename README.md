<h1 align="center">
  Proof of Concept: Split
</h1>

<div align="center">
Simple NestJS application to assess the use and feasibility of some feature toggle tools, projects and services.

This POC uses [Split](https://www.split.io/) and its [Node.js client](https://github.com/splitio/javascript-client).
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
    - `off` (0%): `{ "engines": null }`.
      - This variant is indended to be the disabled state.
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

### Split setup

#### Register

Go to [Split](https://www.split.io/) website and create a free account. Split only accepts corporate emails.

#### Create the necessary feature flags

Within the Split admin, go to "Splits" in the sidebar.

Click on "Create Split" and create the flags according to the rules described in the [Toggles](#toggles) section. Once a flag is created, Split redirects to the flag configuration screen, to add rules and other definitions.

Below are some tips for the process.

- **`freePlanEnabled` and `antiFraudEnabled` on/off switches**
  - Click "Add rules".
  - In "Define treatments" there are already 2 pre-defined states: `on` and `off`. Leave it untouched as that's what we're going to use.
  - In "Set the default rule", select `on`.
  - Save changes and confirm.
- **`pixEnabled` switch with allowlist**
  - Click "Add rules".
  - In "Define treatments" there are already 2 pre-defined states: `on` and `off`. Leave it untouched.
  - In "Create whitelists":
    - Select `on` for "Whitelist For Treatment".
    - In "User", insert the IDs mentioned for this flag in the [Toggles](#toggles) section.
  - In "Set the default rule", select `off`. It's going to be *disabled* for anyone that's not allowlisted.
  - Save changes and confirm.
- **`antiFraudEngine` flag with variants**
  - Click "Add rules".
  - In "Define treatments":
    - Delete `on`. Keep `off`.
    - Create all the variants described for this flag in the [Toggles](#toggles) section.
  - Expand "Attach configuration to your treatments".
    - Select JSON format.
    - Paste the payload for each variant, as described in [Toggles](#toggles).
  - In "Set the default rule":
    - Select "percentage" in the "serve" dropdown.
    - Enter the % distribution for each variant as per the definition.
    - `off` will be left with a weight of 0.
  - Save changes and confirm.

#### Get an API token

Click for the icon at the top of the sidebar and then "Admin settings". On the dashboard, click "API Keys".

Find the key with type `server-side` and environment `Staging-Default`.

Click "Copy" and save this key as we will use it below.


### API setup

#### Get the code

Clone this repo, fetch and switch to the `split` branch.

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

- `SPLIT_API_KEY` (required): API token for client access, generated in [Get an API token](#get-an-api-token).

- `APP_NAME` (optional): the name of the application. It can be left untouched using the value already assigned to this variable. Most PoCs in this repo interpolate this name with the name of the service being tested. **Default:** `feature-toggle-poc`.
- `APP_ENV` (optional): app environment. Service environment. It may be necessary if the service used in the plan has the functionality of multiple environments. **Default:** `default`.

The other variables from the `.env.example` file can be left empty as they are not used.

#### Start the API

```shell
npm run start:dev
```

The API will be available at [http://localhost:3000](http://localhost:3000).

You can now play around with the flag states in the Unleash admin and call the [routes](#routes) from this API.

## License

[MIT](LICENSE)
