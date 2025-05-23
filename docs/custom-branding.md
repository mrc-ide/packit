# Custom branding configuration

When an organisation or team deploys an instance of Packit, they may configure several aspects of 'branding', including colours, logos, and text. All settings are optional, so Packit implements defaults for most of them.

A detailed overview of how this branding is configured during deployment lives in the README of [packit-deploy](https://github.com/mrc-ide/packit-deploy), which contains example configurations.

Here follow some implementation details of particular interest to this repo. These are shaped by a desire to have the custom branding features loaded as quickly as possible, and to avoid a 'flash' of default branding while the custom branding is fetched.

VIMC logos and favicons are stored [here](https://www.dropbox.com/scl/fo/pua5qofw4y69in0yhnyup/AOXS_LfKxFck98yPHuln3Js?rlkey=wbzxxnpbpegkw17csxkrezmqn&e=2&dl=0) and the VIMC colour palette is defined [here](https://www.dropbox.com/scl/fo/221y02ybww056pyy0rtyf/AMoJn-oM6jEWaotIhXsx9vE?dl=0&e=2&rlkey=6x6rmq2w0x4stufiu2mh69c1i) (you'll probably have to be invited to the dropbox to access these).

## Favicon

In [`public/index.html`](public/index.html), the deploy tool replaces the string `favicon.ico` with the file name of the configured favicon (if supplied during deployment). By allowing any file name, this implementation allows the file to have a different extension (e.g. `.png`) as preferred by the hosting organisation. At the time of writing, by default, the app doesn't have a favicon, so will use the browser's default favicon.

N.B. in the case of the favicon.ico file in VIMC's favicon dropbox folder, I found that it still had a white background when the browser (as opposed to Packit) was in dark mode, so I used an online converter to create an ico file from a png (cropped from their portrait logo), since there are some minor reasons to prefer `.ico` to `.png`. (Those are: backwards-compatibility for very old browsers, and things like [this](https://stackoverflow.com/a/11092646).)

## Page title

Again in [`public/index.html`](app/public/index.html), the deploy tool replaces the title tag with the configured brand name (if supplied during deployment).

## Brand name

This is used as the app's name in the header component, and likely will be re-used elsewhere in the app. The front end derives it from the page title, storing it in the context of a BrandingProvider that makes it available across the app. Deriving it from the page title, rather than via a request to the back-end, is intended to save the time it takes to make that trip.

## Logo configuration

The variables to keep track of here are the logo file itself (and its file name), the alt text for the logo, and the navigation destination for clicks on the logo. This information is stored in the context of the BrandingProvider mentioned above, and is derived ultimately from the environment variables served by the back end.

The logo files are inserted by the deploy tool into the [public/img](app/public/img) folder. This repo may contain example logo files in the same folder, for development.

With regards to size/dimensions, the logo's height will be constrained to the height of the header. The proportions between height and width are maintained in order to preserve the design of the logo.

Developers can change the logo config either by setting the packit.branding properties in the back end ([here](api/app/src/main/resources/application.properties) or by setting the environment variables), or by manipulating the value returned by [useGetLogoConfig](app/src/app/components/providers/hooks/useGetLogoConfig.ts) in the front end.

## Colours

See [packit-deploy](https://github.com/mrc-ide/packit-deploy) README for considerations about choice of colours and a list of configurable colours and descriptions.

At the time of writing, the accent colours are used for some button styles and for the border of the header. We may find other places to introduce it in future.

The deploy tool replaces the custom.css file wholesale with css rules that encode the configured colours as css variables (if colour configuration is provided). These are picked up by [app/tailwind.config.js](app/tailwind.config.js) as properties for Tailwind to include in various css class definitions. We define those Tailwind properties to reference both the custom variable names as well as fallbacks, so that, if the custom css variables are undefined, the browser will apply those default colours (defaults defined in [app/src/styles/globals.css](app/src/styles/globals.css)).

The default branding colours of Packit are different from the examples in the deploy tool, so that developers can easily see which colour is being used. The default colour values follow the expected dark/lightness of the customisable colours: e.g. '--accent' is a dark colour and '--accent-foreground' is a light colour.

In order for all the variables to be defined, the deploy tool copies the dark colour settings from the light ones if no dark ones are provided. This means that the front-end doesn't know whether the hosting organisation configured specific dark values or not.

## Dark mode options

Dark mode affects styling colours, but has no effect on logos.

In order to minimise the demands made of the hosting organisation and to reduce code complexity, it is a second-class feature (hence the default theme being light mode). A premise here is that dark mode is not an essential requirement and so we should strive to avoid creating work for ourselves or others around maintaining it.

Hosting organisations may not have the resources, or not care enough about dark mode, to have designed a logo that will work in both modes (which would often entail different colouring). An assumption that the organisation is equally happy with their branding resources in both modes is one that will often be broken. With light mode as the default, it's reasonable for an organisation to provide only a single set of accent colours and logos; they would only have to do the work of ensuring good colour contrasts once. With dark mode fully supported, we would be demanding more work from them to set up their instance, by doubling the number of colours and logos that they must configure. So we thought it would be preferable to make light mode the default, and then if a user still finds dark mode usable, they can make the switch.
