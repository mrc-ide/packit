package packit.service

import packit.model.LoginRequest

interface LoginService
{
    fun authenticateAndIssueToken(loginRequest: LoginRequest): Map<String, String>
    fun authConfig(): Map<String, Any> {
        return emptyMap()
    }
}
