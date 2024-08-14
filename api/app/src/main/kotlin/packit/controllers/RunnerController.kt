package packit.controllers

import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import packit.model.dto.GitBranches
import packit.model.dto.OrderlyRunnerVersion
import packit.model.dto.Parameter
import packit.service.RunnerService

@RestController
@RequestMapping("/runner")
@PreAuthorize("hasAuthority('packet.run')")
class RunnerController(private val runnerService: RunnerService)
{
    @GetMapping("/version")
    @ResponseBody
    fun getVersion(): ResponseEntity<OrderlyRunnerVersion>
    {
        return ResponseEntity.ok(runnerService.getVersion())
    }

    @PostMapping("/git/fetch")
    fun gitFetch(): ResponseEntity<Unit>
    {
        runnerService.gitFetch()
        return ResponseEntity.noContent().build()
    }

    @GetMapping("git/branches")
    fun getBranches(): ResponseEntity<GitBranches>
    {
        return ResponseEntity.ok(runnerService.getBranches())
    }

    @GetMapping("/{packetGroupName}/parameters")
    fun getParameters(
        @PathVariable packetGroupName: String,
        @RequestParam(defaultValue = "HEAD") ref: String
    ): ResponseEntity<List<Parameter>>
    {
        return ResponseEntity.ok(runnerService.getParameters(packetGroupName, ref))
    }
}
