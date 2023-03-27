package packit.helpers

import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.persistence.AttributeConverter

class JsonMapConverter(private val objectMapper: ObjectMapper) : AttributeConverter<Map<String, Any>, String>
{
    override fun convertToDatabaseColumn(parametersMap: Map<String, Any>): String
    {
        return objectMapper.writeValueAsString(parametersMap)
    }

    override fun convertToEntityAttribute(parametersJson: String): Map<String, Any>
    {
        return objectMapper.readValue(parametersJson, Map::class.java) as Map<String, Any>
    }
}
