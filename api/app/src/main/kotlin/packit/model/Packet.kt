package packit.model

import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.persistence.*

@Entity
@Table(name = "packet")
data class Packet(
    @Id
    val id: String,
    val name: String,
    val displayName: String,
    @Column(name = "parameters", columnDefinition = "json")
    val parameters: String,
    val published: Boolean,
)
{
    constructor(
        id: String,
        name: String,
        displayName: String,
        parameters: Map<String, String>,
        published: Boolean,
    ) : this(id, name, displayName, ObjectMapper().writeValueAsString(parameters), published)
}
