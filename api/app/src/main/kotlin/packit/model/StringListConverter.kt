package packit.model

import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

// The purpose of the converter is to handle the conversion between the database representation (an array of strings)
// and the entity representation (a list of strings). This is necessary because JPA does not natively support mapping
// a database array type directly to a Java List. JPA does not support String[] as a basic attribute type. The converter
// ensures that the data is correctly transformed when reading from and writing to the database.

@Converter
class StringListConverter : AttributeConverter<List<String>, Array<String>> {
    override fun convertToDatabaseColumn(attribute: List<String>?): Array<String>? {
        return attribute?.toTypedArray()
    }

    override fun convertToEntityAttribute(dbData: Array<String>?): List<String>? {
        return dbData?.toList()
    }
}