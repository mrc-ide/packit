package packit.unit.repository

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.context.ActiveProfiles
import packit.model.Packet
import packit.repository.IndexRepository
import kotlin.test.assertEquals

@DataJpaTest
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class IndexRepositoryTest
{
    @Autowired
    lateinit var indexRepository: IndexRepository

    val packet = listOf(
        Packet("1", "test1", "test name1", "", false),
        Packet("2", "test2", "test name2", "", false)
    )

    @Test
    fun `gets all index data`()
    {
        indexRepository.saveAll(packet)

        val result = indexRepository.findAll()

        assertEquals(result, packet)
    }

}

