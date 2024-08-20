package packit.model.dto

import com.fasterxml.jackson.annotation.JsonAlias

data class GitBranches(
    @JsonAlias("default_branch")
    val defaultBranch: GitBranchInfo,
    val branches: List<GitBranchInfo>
)

data class GitBranchInfo(
    val name: String,
    @JsonAlias("commit_hash")
    val commitHash: String,
    val time: Long,
    val message: List<String>
)
