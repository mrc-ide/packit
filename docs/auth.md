## Authentication in Packit

Packit uses [Spring Security](https://spring.io/projects/spring-security) for authentication. For logging in through the front end web app, we currently 
support GitHub authentication using OAuth2 and a partial demo Basic auth method (to demonstrate supporting multiple auth types). We
will eventually replace the Basic auth support with Montagu auth. We also support authenticated API access, currently
with GitHub auth only. 

We use JWT tokens rather than cookies for authenticated access, both from the browser and using the API. 

Packit instances can be configured to run without requiring authentication, or to support GitHub or Basic auth, or both.
If GitHub Auth is enabled, it is restricted to users who are members of configured authorized Organizations (or Teams - TODO!).

Login through the web app uses standard Spring Security configuration to redirect user to provide credentials via
GitHub.

Authentication for API access uses a bespoke approach where the `LoginController` directly invokes the
`GithubAPILoginService` class.

### Auth configuration in Packit
Configuration relevant to auth can be found in both `application.properties` (custom Packit config) and `application.properties`
(Spring Boot configuration). Development versions of both files can be found in `api/app/src/main/resources`.

Relevant `application.properties` values:
- `auth.basic.secret` Secret used to encode and decode JWT tokens
- `auth.oauth2.redirect.url` The front end API Packit url to redirect to on successful user authentication - this should
be of form `[FRONT END BASE URL}/redirect`
- `auth.enableGithubLogin` true if GitHub auth should be enabled for this instance
- `auth.enableFormLogin` true if Basic auth should be enabled for this instance
- `auth.expiryDays` Number of days before a JWT token shoul expire
- `auth.enabled` true if auth is enabled - if false, all data is visible to any user, and no login is required
- `auth.githubAPIBaseUrl` Base URL for querying GitHub API to verify PAT and check user Org membership - this is unlikely to change!
- `auth.githubAPIOrgs` Comma separated list of authorized GitHub Organizations - a GitHub user must be a member 
of one of these in order to log in. 

Relevant `application.properties` values:
- `spring.security.oauth2.client.registration.github.client-id`
- `spring.security.oauth2.client.registration.github.client-secret`

These specify a [Github App](https://docs.github.com/en/apps) (or GitHub OAuth app) to use - users will be required to authorize the app in order to
log in. 

### Local development 

To run Packit locally with GitHub auth, you'll need the client id and client secret of a GitHub App, or GitHub OAuth app. 
You can either set one up yourself associated with your GitHub account (in Settings -> Developer Settings),
or use the details of an existing test app, which are stored in the MRC Vault at
`secret/packit/oauth/test`.

Update `api/app/src/main/resources/application.properties` by setting the values of
`spring.security.oauth2.client.registration.github.client-id` and 
`spring.security.oauth2.client.registration.github.client-secret` to the details of the test app. 

Be sure not to push these config changes!

Make sure you also have `auth.enabled` and `auth.enableGithubLogin` set to `true` in `application.properties`.


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

#### Authenticated requests 

These classes are used to verify JWT tokens received from both GitHub and Basic authentication

![image](Packit%20JWT%20authenticate.drawio.png)

#### Browser GitHub Auth Sequence
 
The frontend (React) app stores the JWT token in local storage. If a token is not present, or if it has expired
(TODO! - will be merged with mrc-4638), any attempt to access a protected route (any route other than `/login`) will navigate to `/login`.

If the user chooses
Login with GitHub, this navigates to `/oauth2/authorization/github` in the backend (SpringBoot) app. This triggers
the Spring Security OAuth2 pipeline which manages the redirect to GitHub to confirm user credentials, which invokes
the configured custom code (`OAuth2UserService` and either `OAuth2SuccessHandler` or `OAuth2FailureHandler`). 

When this sequence is complete,
SpringBoot will redirect to the configured redirect location in the React front end, `/redirect` (handled by
`Redirect.tsx`), passing the JWT token. 

The front end stores the token, and uses it in all subsequent requests to the 
back end, passing it as a Bearer token in the Authorization header. 
![image](Packit%20browser%20login.drawio.png)


#### API GitHub Auth Sequence

To login with GitHub over the API, a POST request is made to `/auth/login/github` in Packit backend passing the user's GitHub
personal access token in the request body's `githubtoken` field. 
The GitApiLoginService class is invoked by the LoginController to:
- verify the PAT with GitHub API
- check user's membership of configured authorized org
- generate and return a JWT token which will be included in the request response. This token should be included in the 
as a Bearer token in the Authorization header in all subsequent requests to the API.
- return an error response if authentication requirements not satisfied, e.g. empty PAT provided or user not member of
an authorized org. 

### External JWT Authentication

In addition to interactive authentication for humans, Packit support authentication using a JWT from an external
provider. The client must exchange this 3rd-party token for a Packit-issued JWT, which may be used in the application.

This scenario is useful for automated jobs that need to connect to Packit, such as
[GitHub Actions workflows][github-oidc] or [Buildkite pipelines][buildkite-oidc]. In either case, the continuous
integration environment provides a way for the job to obtain a signed JWT identifying it. Packit verifies the JWT
against a list of policies to determine whether the token is accepted.

These are the properties that configure the external JWT authentication:
- `auth.externalJwt.audience`: the required `aud` claim. If this property is missing, authentication from external JWTs is disabled.
- `auth.externalJwt.policy`: the list of policies
- `auth.externalJwt.policy[i].jwk-set-uri`: the URL to the set of public keys used by the issuer
- `auth.externalJwt.policy[i].issuer`: the required `iss` claim
- `auth.externalJwt.policy[i].required-claims.${name}`: custom required claims
- `auth.externalJwt.policy[i].granted-permissions`: scopes that are granted through the authentication process
- `auth.externalJwt.policy[i].token-duration`: the lifetime of tokens issued in exchange

The claims which may be referenced by the `requiredClaims` property depend on the token issuer. For example, GitHub
provides claims such as `repository`, `repository_owner`, `workflow`, `event_name` or `ref` (the Git reference).
Buildkite provides claims such as `organization_slug`, `pipeline_slug` or `build_branch`. At the moment, only
string-valued claims are supported.

For example, the following configuration snippet would allow any GitHub actions workflow running in the `mrc-ide/packit`
repository to read and write packets.

```
auth.external-jwt.audience=https://packit.dide.ic.ac.uk/reside
auth.external-jwt.policy[0].issuer=https://token.actions.githubusercontent.com
auth.external-jwt.policy[0].jwk-set-uri=https://token.actions.githubusercontent.com/.well-known/jwks
auth.external-jwt.policy[0].required-claims.repository=mrc-ide/packit
auth.external-jwt.policy[0].granted-permissions=outpack.read,outpack.write
```

[github-oidc]: https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect
[buildkite-oidc]: https://buildkite.com/docs/pipelines/security/oidc
