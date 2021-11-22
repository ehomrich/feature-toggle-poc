<h1 align="center">
  Proof of Concept: LaunchDarkly
</h1>

<div align="center">
Simple NestJS application to assess the use and feasibility of some feature toggle tools, projects and services.

This POC uses [LaunchDarkly](https://launchdarkly.com/) and its [Node.js client](https://github.com/launchdarkly/node-server-sdk).
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
  - Variants and its weights and payloads in CSV format:
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

### LaunchDarkly setup

#### Register

Go to [LaunchDarkly](https://launchdarkly.com/) website and sign up for a trial account. The trial lasts 14 days.

#### Create the necessary feature flags

Within the LaunchDarkly admin, change the environment in the sidebar. Switch from Production to Test.

Then go to "Feature flags" in the sidebar.

Click on "Create flag" and create the flags according to the rules described in the [Toggles](#toggles) section.

Boolean flags (on/off switches) can be set directly from the flag creation drawer.

Once a flag is created, LD redirects to the flag configuration screen, to add rules and other definitions.

Below are some tips for the process.

- **`freePlanEnabled` and `antiFraudEnabled` on/off switches**
  - In the flag creation drawer, scroll to the end.
  - In "Flag variations", select boolean. This is usually the option that is selected by default.
    - This flag has only 2 variations: `true` and `false`. Add a name and description for each variation if it makes sense.
  - In "Default variation", define which variation will be returned if the flag according to each state of the flag (ON and OFF).
    - For boolean flags, `ON = true` and `OFF = false` are selected by default.
  - Click "Save flag".
  - On the newly created flag configuration screen, activate the flag on the "Targeting" switch.
    - Flags can also be activated/deactivated by switching the on/off button on the flags list screen.
- **`pixEnabled` switch with allowlist**
  - Create a boolean flag as described above.
  - On "Target individual users", click "Add user targets" to expand.
    - For the `true` variation, insert the user IDs as described for this flag in the [Toggles](#toggles) section.
    - Leave the `false` variation with an empty allowlist.
  - On "Default rule", select `false`.
  - Activate the flag on the "Targeting" switch.
  - Save.
- **`antiFraudEngine` flag with variants**
  - In the flag creation drawer, scroll to the end.
  - In "Flag variations", select JSON.
  - Create 5 variations and paste their payloads, as described in [Toggles](#toggles).
  - On "Default rule", select `off`.
  - On the newly created flag configuration screen, go to the "Default Rule" section and select "a percentage rollout".
    - Enter the % distribution for each variant as per the definition.
    - `off` will be left with a weight of 0.
    - On the "Advanced" button, select "key".
  - Make sure `off` is selected in the "If targeting is off, serve" button at the end of the screen.
  - Activate the flag on the "Targeting" switch.

#### Get an API token

Click "Account settings" on the sidebar. On the dashboard, click on the "Projects" tab.

Find the "SDK KEY" for the Test environment. Click on the key to copy it to the clipboard.

Save this key as we will use it below.


### API setup

#### Get the code

Clone this repo, fetch and switch to the `launchdarkly` branch.

#### Install

> Dependencies are the same across **all** branches. Once installed in any of the branches, this step can be skipped.

```shell
npm run install
```

##### Set the environment variables

At the project root, create a copy of the `.env.example` file as `.env`

```shell
cp .env.example .env
```

Fill in `.env` accordingly:

- `LAUNCHDARKLY_SDK_KEY` (required): API token for client access, generated in [Get an API token](#get-an-api-token).

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
