package packit.unit.helpers

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import packit.helpers.JsonMapConverter

class JsonMapConverterTest
{
    private val objectMapper = ObjectMapper()

    @Test
    fun `converts map to string and vice versa`()
    {
        val paramsMap = mapOf(
                "name" to "John",
                "age" to 30,
                "isEmployed" to true
        )

        val jsonParamsString = objectMapper.writeValueAsString(paramsMap)

        val converter = JsonMapConverter(objectMapper)

        val resultString = converter.convertToDatabaseColumn(paramsMap)

        val resultMap = converter.convertToEntityAttribute(jsonParamsString)

        assertEquals(jsonParamsString, resultString)

        assertEquals(paramsMap, resultMap)
    }
}
