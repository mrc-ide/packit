
Packit uses [Spring Security](https://spring.io/projects/spring-security) for authentication. We currently support Github authentication using
OAuth2 and a partial demo Basic auth method (to demonstrate supporting multiple auth types). We
will eventually replace the Basic auth support with Montagu auth. 

We use JWT tokens rather than cookies for authentication both from the browser and using the API. 


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

These diagrams show the main security classes used for GitHub auth and how they interact:

#### Github Login
![image](Packit%20Github%20login.drawio.png)

#### Authenticate requests 

These classes are used for authenticated JWT tokens received from both GitHub and Basic authentication
![image](Packit%20JWT%20authenticate.drawio.png)

#### Browser GitHub Auth Sequence

To login with Github, the web app front end requests from the ... endpoint
The front end checks if the token has expired. 

The app front end stores JWT token in local storage and presents it in Auth header (TODO) when accessing any backend endpoint. 


#### API GitHub Auth Sequence

To login with GitHub over the API, a request should be made passing the user's personal access token in the request (TODO) - 
the PAT will be verified with GitHub, user's membership of authorized org checked, and a JWT token returned. This token
should be included in the Auth header in all subsequent requests to the API. 



