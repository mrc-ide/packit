package packit.model.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class GitBranchInfo(
    val name: String,
    @JsonProperty("commit_hash")
    val commitHash: String,
    val time: Long,
    val message: List<String>
)
