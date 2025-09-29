orderly::orderly_dependency("explicit", "20240729-154639-25b955eb", c(graph.png = "mygraph.png"))
orderly::orderly_dependency("custom_metadata", "latest", "data.csv")
orderly::orderly_artefact("Final plot", "graph.png")
