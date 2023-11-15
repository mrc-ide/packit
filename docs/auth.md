## Authentication in Packit

Packit uses [Spring Security](https://spring.io/projects/spring-security) for authentication. For logging in through the front end web app, we currently 
support GitHub authentication using OAuth2 and a partial demo Basic auth method (to demonstrate supporting multiple auth types). We
will eventually replace the Basic auth support with Montagu auth. We also support authenticated API access, currently
with GitHub auth only. 

We use JWT tokens rather than cookies for authenticated access, both from the browser and using the API. 

Login through the web app uses standard Spring Security configuration to redirect user to provide credentials via
GitHub.

Authentication for API access uses a bespoke approach where the `LoginController` directly invokes the
`GithubUserLoginService`.

### Auth configuration in Packit
TODO: App config & spring config


### Local development 

To run Packit locally with GitHub auth, you'll need the client id and client secret of an OAuth app in Github. 
You can either set one up yourself associated with your GitHub account (in Settings -> Developer Settings -> OAuth 
apps), or use the details of an existing test app, which are stored as a in the MRC Vault at
`secret/packit/oauth/test`.

Update `api/app/src/main/resources/application-properties` by setting the values of
`spring.security.oauth2.client.registration.github.client-id` and 
`spring.security.oauth2.client.registration.github.client-secret` to the details of the test app. 

Be sure not to push these config changes!


### WebSecurityConfig

The starting point for securing the application is the 
[WebSecurityConfig](https://github.com/mrc-ide/packit/blob/main/api/app/src/main/kotlin/packit/security/WebSecurityConfig.kt)
class. This includes Beans to tell Spring Security how to manage security in the app, primarily:
- `securityFilterChain` - this defines the main security logic for the application as a chain of filters. This 
conditionally configures oauth2 support, including a custom user service and success handler, if github auth is enabled
in application config. Also defines which routes require securing e.g. none if auth is not enabled.
- `authenticationManager` - this defines the user service for Basic auth, not through the main security 
filter chain (but it amounts to the same thing).

The user services referenced here, and their own dependencies, make use of Spring's dependency injection, where
classes annotated as `@Component` or `@Service` are automatically injected as constructor parameters when a parameter
of an interface type supported by those classes is required.

### Github Auth

These diagrams show the main security classes used for GitHub auth and how they interact:

#### Github Login
![image](Packit%20Github%20login.drawio.png)


TODO: NB Browser login not currently verifying org membership - make ticket

#### Authenticate requests 

These classes are used to verify JWT tokens received from both GitHub and Basic authentication
![image](Packit%20JWT%20authenticate.drawio.png)

#### Browser GitHub Auth Sequence
 
The frontend (React) app stores the JWT token in local storage. If a token is not present, or if it has expired (TODO!),
any attempt to access a protected route (any route other than `/login`) will navigate to `/login`. If the user chooses
Login with GitHub, this navigates to `/oauth2/authorization/github` in the backend (SpringBoot) app. This triggers
the Spring Security OAuth2 pipeline which manages the redirect to GitHub to confirm user credentials, which invokes
the two configured pieces of custom code (`OAuth2UserService` and `OAuth2SuccessHandler`). When this sequence is complete,
SpringBooth will redirect to the configured redirect location in the React front end, `/redirect` (handled by
`Redirect.tsx`), passing the JWT token. The front end stores the token, and uses it in all subsequent requests to the 
back end, passing it as a Bearer token in the Authorization header. 
![image](Packit%20browser%20login.drawio.png)


#### API GitHub Auth Sequence

To login with GitHub over the API, a POST request is made to `/login/github` in Packit backend passing the user's GitHub
personal access token in the request body's `githubtoken` field. 
The GitApiLoginService class is invoked by the LoginController to:
- verify the PAT will with GitHub API
- check user's membership of configured authorized org
- generate and return a JWT token which will be included in the request response. This token should be included in the 
as a Bearer token in the Authorization header in all subsequent requests to the API. 

TODO: remarks on front end vs back end
TODO: Cors config??
TODO: document what happens on Auth failure
TODO: ticket for expiring - but possible make this a redirect from the front end - can't redirect though because it's
just an API.... Check if expiry is checked in extract ticket!



