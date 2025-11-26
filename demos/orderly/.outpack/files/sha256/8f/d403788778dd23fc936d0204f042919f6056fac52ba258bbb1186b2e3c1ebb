for (i in 1:200) {
  file <- paste0("A-really-stupidly-lengthily-named-file-", i, ".rds")
  saveRDS(list(a = 1, b = 2, c = 3), file)
  orderly::orderly_artefact(description=paste("File", i), file)
}