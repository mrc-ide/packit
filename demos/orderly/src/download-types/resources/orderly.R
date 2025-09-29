data <- read.csv("data.csv", stringsAsFactors = FALSE)
png(paste0("artefact1/a_graph_with_such_a_long_file_name_that_it_begins_to_run_the_very_real_risk_of_needing_to_be",
           "_truncated_in_the_front_end_so_long_as_the_file_names_length_exceeds_the_width_of_its_UI_container.png"))
plot(data)
dev.off()

artefact1_files <- list.files("artefact1/", full.names = TRUE)

orderly::orderly_artefact(description = "An artefact containing several files", files = artefact1_files)

writeLines(text = "<html><body><h1>TEST</h1></body></html>", "presentation.html")
orderly::orderly_artefact(description = "An artefact containing a single file", files = "presentation.html")

orderly::orderly_resource("data.csv")
orderly::orderly_resource("input_files/plot.png") # Test use of directories

orderly::orderly_shared_resource(a_renamed_common_resource.csv = "a_common_resource.csv")
