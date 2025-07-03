# Demo reports

At the moment this contains one demo `orderly2` directory for testing. We might want 
to add a vanilla `outpack` directory as well.

To add a new report to the `orderly` directory:

1. install the `orderly2` R package from github:
    ```devtools::install_github("mrc-ide/orderly2")```
1. add a new folder to `./orderly/src` with a valid `orderly.R` script
1. set the working directory in R using e.g. `setwd("/home/jsmith/projects/mrc-ide/packit/demos/orderly")`
1. run the new report with `orderly2::orderly_run(<name>)`
1. commit the results to GitHub to use in CI

### Using the 'massive-file' report for testing how the app copes with very large files

Since very large files impose large costs in terms of start-up time, it would inconvenience developers for us to include
a 'massive-file' demo report in full.

If you wish to test how the app copes with very large files, follow these instructions:

1. Run the 'massive-file' script as above.
1. Run `scripts/clear-docker` and `scripts/run-dependencies` and wait for it to complete. At this point, the large file
will have been stored in the outpack server, ready for us to try to download it.
1. Create a build of the packit backend using `./api/scripts/build`, and (if your goal is to test that the server does
not run out of memory when transferring large files) run this build using a reduced heap size, e.g. 128MB, by running
this command from the `./api` directory: `java -Xmx128m -jar app/build/libs/app.jar`
1. Run the front-end (if you want to test the full stack) from the /app directory as normal (`npm run dev`). Navigate to
`massive-file` packet download page and do your testing. You can also test if the main thread gets blocked by the
download by trying to make requests while the download is in progress, such as by making other download requests.
1. Clean up your downloads folder! These files are big.
