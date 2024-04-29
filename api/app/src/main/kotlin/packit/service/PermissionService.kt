package packit.service

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import packit.exceptions.PackitException
import packit.model.Permission
import packit.repository.PermissionRepository

interface PermissionService
{
    fun checkMatchingPermissions(permissionsToCheck: List<String>): List<Permission>
}


@Service
class BasePermissionService(
    private val permissionRepository: PermissionRepository
) : PermissionService
{
    override fun checkMatchingPermissions(permissionsToCheck: List<String>): List<Permission>
    {
        val matchedPermissions = permissionRepository.findByNameIn(permissionsToCheck)

        if (matchedPermissions.size != permissionsToCheck.size)
        {
            throw PackitException("invalidPermissionsProvided", HttpStatus.BAD_REQUEST)
        }
        return matchedPermissions
    }

}