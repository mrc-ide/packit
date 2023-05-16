At the moment this contains one demo `orderly3` directory for testing. We might want 
to add a vanilla `outpack` directory as well.

To add a new report to the `orderly` directory:

1. install the `orderly3` R package from github:
    ```devtools::install_github("mrc-ide/orderly3")```
1. add a new folder to `./orderly/src` with a valid `orderly.R` script
1. run the new report with `orderly3::run_report(<name>)`
1. commit the results to GitHub to use in CI
