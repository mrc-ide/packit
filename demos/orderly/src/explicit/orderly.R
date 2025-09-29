orderly::orderly_resource("data.csv")
orderly::orderly_artefact("A graph of things", "mygraph.png")

data <- read.csv("data.csv", stringsAsFactors = FALSE)
png("mygraph.png")
plot(data)
dev.off()
