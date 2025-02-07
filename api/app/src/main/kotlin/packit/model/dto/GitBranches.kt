package packit.model.dto

import com.fasterxml.jackson.annotation.JsonAlias

data class GitBranches(
    @JsonAlias("default_branch")
    val defaultBranch: String?, // null when no HEAD. This should not happen as we do a git clone.
    val branches: List<GitBranchInfo>
)

data class GitBranchInfo(
    val name: String,
    @JsonAlias("commit_hash")
    val commitHash: String,
    val time: Long,
    val message: String
)
