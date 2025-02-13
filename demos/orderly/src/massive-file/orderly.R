# Due to the resulting file size (900MB), the outpack metadata and file are not committed to the repository, but the
# orderly script is provided here for convenience.
# See demos/README.md for more information on how to use this report.

write.csv(matrix(rnorm(5e7), ncol = 10), "massive.csv", row.names = FALSE)
orderly2::orderly_artefact("Massive file", "massive.csv")