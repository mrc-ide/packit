
Packit uses [Spring Security](https://spring.io/projects/spring-security) for authentication. We currently support Github authentication using
OAuth2 and a partial demo Basic auth method (to demonstrate supporting multiple auth types). We
will eventually replace the Basic auth support with Montagu auth. 

We use tokens rather than cookies for auth during web sessions. These same tokens are used for auth over the API.


###
TODO: App config & spring config

### WebSecurityConfig

The starting point for securing the application is the 
[WebSecurityConfig](https://github.com/mrc-ide/packit/blob/main/api/app/src/main/kotlin/packit/security/WebSecurityConfig.kt)
class. This defines beans to tell spring how to manage security in the app, primarily:
- `securityFilterChain` - this defines the main security logic for th application as a chain of filters. This 
conditionally adds a user service and success handler for github auth, if supported by application config, and defines
which routes require securing e.g. none if auth is not enabled.
- `authenticationManager` - this defines the user service for Basic auth, not through the main security 
filter chain (but it amounts to the same thing).

The user services referenced here, and their own dependencies, make use of Spring's dependency injection, where
classes annotated as `@Component` or `@Service` are automatically injected as constructor parameters when a parameter
of an interface type supported by those classes is required.

### Github Auth

This diagram shows the security classes used for Github auth and how they interact:

