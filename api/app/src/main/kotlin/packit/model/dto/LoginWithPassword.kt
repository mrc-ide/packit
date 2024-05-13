package packit.model.dto

import org.jetbrains.annotations.NotNull

data class LoginWithPassword(@NotNull val email: String, @NotNull val password: String)
