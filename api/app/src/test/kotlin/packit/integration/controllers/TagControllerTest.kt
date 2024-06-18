package packit.integration.controllers

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.TestInstance
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpMethod
import packit.integration.IntegrationTest
import packit.integration.WithAuthenticatedUser
import packit.model.Tag
import packit.model.dto.TagDto
import packit.model.toDto
import packit.repository.TagRepository
import kotlin.test.Test
import kotlin.test.assertEquals

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class TagControllerTest : IntegrationTest()
{
    @Autowired
    private lateinit var tagRepository: TagRepository

    private lateinit var tags: List<Tag>

    @BeforeAll
    fun setupData()
    {
        tags = tagRepository.saveAll(
            listOf(
                Tag(name = "test-tag-2"),
                Tag(name = "test-tag-1"),
                Tag(name = "test-tag-5"),
                Tag(name = "test-tag-4"),
                Tag(name = "test-tag-3"),
                Tag(name = "tag-testing-1")
            )
        )
    }

    @AfterAll
    fun cleanup()
    {
        tagRepository.deleteAll(tags)
    }

    @Test
    @WithAuthenticatedUser
    fun `can get ordered pageable tags with name filtered`()
    {
        val result = restTemplate.exchange(
            "/tag?pageNumber=0&pageSize=10&filterName=test-tag",
            HttpMethod.GET,
            getTokenizedHttpEntity(),
            String::class.java
        )

        assertSuccess(result)

        val resultTags = jacksonObjectMapper().readTree(result.body).get("content")
            .let {
                jacksonObjectMapper().convertValue(
                    it,
                    object : TypeReference<List<TagDto>>()
                    {}
                )
            }

        assert(resultTags.containsAll(tags.subList(0, 5).map { it.toDto() }))
        assertEquals(5, resultTags.size)
        assertEquals("test-tag-1", resultTags[0].name)
        assertEquals("test-tag-5", resultTags[resultTags.size - 1].name)
    }

    @Test
    @WithAuthenticatedUser
    fun `return correct page information for get pageable tags`()
    {
        val result = restTemplate.exchange(
            "/tag?pageNumber=0&pageSize=10&filterName=test-tag",
            HttpMethod.GET,
            getTokenizedHttpEntity(),
            String::class.java
        )

        assertSuccess(result)

        val resultPage = jacksonObjectMapper().readTree(result.body)
        assertEquals(0, resultPage.get("number").asInt())
        assertEquals(10, resultPage.get("size").asInt())
        assertEquals(1, resultPage.get("totalPages").asInt())
        assertEquals(5, resultPage.get("totalElements").asInt())
    }
}
