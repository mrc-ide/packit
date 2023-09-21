package packit.security.provider

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.exceptions.JWTVerificationException
import com.auth0.jwt.exceptions.SignatureVerificationException
import com.auth0.jwt.exceptions.TokenExpiredException
import com.auth0.jwt.interfaces.DecodedJWT
import org.springframework.stereotype.Component
import packit.AppConfig
import packit.exceptions.PackitException

interface JwtDecoder
{
    fun decode(token: String): DecodedJWT
}

@Component
class TokenDecoder(val config: AppConfig) : JwtDecoder
{
    override fun decode(token: String): DecodedJWT
    {
        try
        {
            return JWT.require(Algorithm.HMAC256(config.authBasicSecret))
                .build()
                .verify(token)
        } catch (e: SignatureVerificationException)
        {
            throw PackitException("Signature failed: ${e.message}")
        } catch (e: TokenExpiredException)
        {
            throw PackitException("Expired failed: ${e.message}")
        } catch (e: JWTVerificationException)
        {
            throw PackitException("Verification failed: ${e.message}")
        }
    }
}
