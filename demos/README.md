At the moment this contains one demo `orderly2` directory for testing. We might want 
to add a vanilla `outpack` directory as well.

To add a new report to the `orderly` directory:

1. install the `orderly2` R package from github:
    ```devtools::install_github("mrc-ide/orderly2")```
1. add a new folder to `./orderly/src` with a valid `orderly.R` script
1. run the new report with `orderly2::orderly_run(<name>)`
1. commit the results to GitHub to use in CI
