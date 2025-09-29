d <- read.csv("data.csv")
d$z <- resid(lm(y ~ x, d))
saveRDS(d, "data.rds")
orderly::orderly_artefact("Processed data", "data.rds")