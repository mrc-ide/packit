package packit.integration.repository

import jakarta.transaction.Transactional
import org.springframework.test.annotation.DirtiesContext
import packit.integration.IntegrationTest

@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
@Transactional
abstract class RepositoryTest: IntegrationTest()
