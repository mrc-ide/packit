package packit.model

import org.jetbrains.annotations.NotNull

data class LoginWithToken(@NotNull val email: String, @NotNull password: String)