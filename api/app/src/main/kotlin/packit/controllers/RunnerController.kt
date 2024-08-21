package packit.controllers

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.RestController
import packit.model.dto.OrderlyRunnerVersion
import packit.service.RunnerService

@RestController
@RequestMapping("/runner")
class RunnerController(private val runnerService: RunnerService)
{
    @GetMapping("/version")
    @ResponseBody
    fun getVersion(): ResponseEntity<OrderlyRunnerVersion>
    {
        return ResponseEntity.ok(runnerService.getVersion())
    }
}
