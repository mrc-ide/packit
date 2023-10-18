package packit.model

import org.jetbrains.annotations.NotNull

data class LoginRequest(
    @NotNull
    val email: String,
    @NotNull
    val password: String
)

data class LoginWithGithubToken(@NotNull val githubToken: String)
