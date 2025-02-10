package packit.model.dto

import com.fasterxml.jackson.annotation.JsonProperty

data class RepositoryFetch(
    @JsonProperty("ssh_key")
    val sshKey: String?
)
