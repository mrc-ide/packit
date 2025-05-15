package packit.unit.helpers

import com.fasterxml.jackson.databind.ObjectMapper

object JSON {
    private val objectMapper = ObjectMapper()

    fun stringify(data: Any): Any {
        return objectMapper.writeValueAsString(data)
    }
}
