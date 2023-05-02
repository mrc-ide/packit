package packit.model

import jakarta.persistence.*
import packit.helpers.JsonMapConverter

@Entity
data class Packet(
        @Id
        val id: String,
        val name: String,
        val displayName: String,
        @Convert(converter = JsonMapConverter::class)
        val parameters: Map<String, Any>,
        val published: Boolean,
)
