package packit.controllers

import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.http.ResponseEntity
import packit.service.RunnerService
import packit.model.dto.OrderlyRunnerVersion

@RestController
@RequestMapping("/runner")
class RunnerController(private val runnerService: RunnerService)
{
    @GetMapping("/version")
    @ResponseBody
    fun getVersion() : ResponseEntity<OrderlyRunnerVersion>
    {
        return ResponseEntity.ok(runnerService.getVersion())
    }
}
