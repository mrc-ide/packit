package packit.repository

import org.springframework.boot.jdbc.DataSourceBuilder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import packit.AppConfig
import javax.sql.DataSource

@Configuration
class DbConfig
{
    @Bean
    fun dataSource(appConfig: AppConfig): DataSource
    {
        val dataSourceBuilder = DataSourceBuilder.create()
        dataSourceBuilder.driverClassName("org.postgresql.Driver")
        dataSourceBuilder.url(appConfig.dbUrl)
        dataSourceBuilder.username(appConfig.dbUser)
        dataSourceBuilder.password(appConfig.dbPassword)
        return dataSourceBuilder.build()
    }
}
