package packit.repository

import packit.model.PacketGroupDisplay

/* Written with reference to https://www.baeldung.com/spring-data-jpa-repository-view */

interface PacketGroupDisplayRepository : ViewRepository<PacketGroupDisplay, String> {
    fun findByName(name: String): PacketGroupDisplay? /* May need to be findByIdName - see "findByIdShopId" */
    /* I would love to de-list the type but I don't know if that will be allowed */
}