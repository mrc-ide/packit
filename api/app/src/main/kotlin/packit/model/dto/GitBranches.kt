package packit.model.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class GitBranches(
    @JsonProperty("default_branch")
    val defaultBranch: GitBranchInfo,
    val branches: List<GitBranchInfo>
)

data class GitBranchInfo(
    val name: String,
    @JsonProperty("commit_hash")
    val commitHash: String,
    val time: Long,
    val message: List<String>
)
