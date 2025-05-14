package packit.controllers

import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import packit.model.dto.UserDto
import packit.model.toDto
import packit.service.UserService

@Controller
@PreAuthorize("hasAuthority('user.manage')")
@RequestMapping("/users")
class UsersController(private val userService: UserService,) {
    @GetMapping
    fun getAllUsers(): ResponseEntity<List<UserDto>>
    {
        val allUsers = userService.getAllNonServiceUsers()
        return ResponseEntity.ok(
            allUsers.map{ it.toDto() }
        )
    }
}
