package packit.clients

import org.springframework.http.ResponseEntity

interface Client
{
    fun <T> get(path: String): ResponseEntity<T>
}
