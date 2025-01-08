package packit.service.utils

import packit.model.CustomMetadata

/**
 * Return the long description for a packet if its custom metadata schema conforms to the orderly schema.
 *
 * @param packetCustomMetadata The packet custom metadata.
 * @return The description for the packet.
 */
fun getDescriptionForPacket(packetCustomMetadata: CustomMetadata): String? {
    val orderlyMetadata = packetCustomMetadata?.get("orderly") as? Map<*, *>
    return (orderlyMetadata?.get("description") as? Map<*, *>)?.get("long") as? String
}

/**
 * Return the display name for a packet if its custom metadata schema conforms to the orderly schema and contains
 * a display name.
 * Also check for 'display name' keys that may exist in non-orderly outpack custom schemas.
 * Falls back to name if no display name.
 *
 * @param packetCustomMetadata The packet custom metadata.
 * @param name The name of the packet.
 * @return The display name for the packet.
 */
fun getDisplayNameForPacket(packetCustomMetadata: CustomMetadata, name: String): String {
    val orderlyMetadata = packetCustomMetadata?.get("orderly") as? Map<*, *>
    val orderlyDisplayName = (orderlyMetadata?.get("description") as? Map<*, *>)?.get("display") as? String
    return orderlyDisplayName?.takeIf { it.isNotBlank() }
        ?: getOutpackPacketDisplayName(packetCustomMetadata)
        ?: name
}

/**
 * Check for 'display name' keys that may exist in non-orderly outpack custom schemas.
 *
 * @param packetCustomMetadata The packet custom metadata.
 * @return The display name for the packet.
 */
private fun getOutpackPacketDisplayName(packetCustomMetadata: CustomMetadata): String? {
    return packetCustomMetadata?.values
        ?.filterIsInstance<Map<String, Any>>()
        ?.firstNotNullOfOrNull { (it["display_name"] as? String) ?: (it["display"] as? String) }
}
