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

This is used as the app's name in the header component, and likely will be re-used elsewhere in the app. The front end derives it from the page title, storing it in the context of a BrandingProvider that makes it available across the app. Deriving it from the page title, rather than via a request to the back-end, is intended to save the time it would take to make that trip.

## Logo configuration

The variables to keep track of here are the logo file itself (and its file name), the alt text for the logo, and the navigation destination for clicks on the logo. This information is stored in the context of the BrandingProvider mentioned above, and is derived ultimately from the environment variables served by the back end.

The logo files are inserted by the deploy tool into the [public/img](app/public/img) folder. This repo may contain example logo files in the same folder, for development.

With regards to size/dimensions, the logo's height will be constrained to the height of the header. The proportions between height and width are maintained in order to preserve the design of the logo.

Developers can change the logo config either by setting the packit.branding properties in the back end ([here](api/app/src/main/resources/application.properties) or by setting the environment variables), or by manipulating the value returned by [useGetLogoConfig](app/src/app/components/providers/hooks/useGetLogoConfig.ts) in the front end.

## Colours

See [packit-deploy](https://github.com/mrc-ide/packit-deploy) README for considerations about choice of colours and a list of configurable colours and descriptions.

At the time of writing, the accent colours are used for some button styles and for the border of the header. We may find other places to introduce it in future.

The deploy tool replaces the custom.css file wholesale with css rules that encode the configured colours as css variables (if colour configuration is provided). These are picked up by [app/tailwind.config.js](app/tailwind.config.js) as properties for Tailwind to include in various css class definitions. We define those Tailwind properties to reference both the custom variable names as well as fallbacks, so that, if the custom css variables are undefined, the browser will apply those default colours (defaults defined in [app/src/styles/globals.css](app/src/styles/globals.css)).

The default branding colours of Packit are different from the examples in the deploy tool, so that developers can easily see which colour is being used. The default colour values follow the expected brightness of the customisable colours: e.g. '--accent' is dark in colour and '--accent-foreground' is light in colour.

### Theme

Dark-mode and light-mode are enabled/disabled by environment variables set in the API by the deploy tool. If both are enabled, the user may toggle between them. The theme affects styling colours, but has no effect on logos.
