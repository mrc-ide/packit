package packit.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import packit.model.RolePermission

@Repository
interface RolePermissionRepository : JpaRepository<RolePermission, Int>
{
    @Modifying
    @Transactional
    @Query("DELETE FROM RolePermission rp WHERE rp.id IN :ids")
    fun deleteAllByIdIn(ids: List<Int>)
}
