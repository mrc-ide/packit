# R packages testing directory

This directory exists in order to contain known R packages, which can be checked into git so that they can be consistent across testing/dev environments and machines. This enables deterministic integration and e2e tests of the R library endpoint(s), since otherwise we would be writing assertions about highly variable environments (which differ in both _where_ R packages are installed, as well as which packages are installed).

Example of the minimum required for `installed.packages()` to be able to detect an R package:
```sh
minimalRPackage
├── DESCRIPTION
└── Meta
    └── package.rds
```

`package.rds` is derived from `DESCRIPTION` when we run `install.packages(pathToPackage, lib = "./R", repos = NULL, type = "source")`, and is what is read by `installed.packages()`.
