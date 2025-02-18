import os
from pyorderly.outpack.location_packit import packit_authorisation

# Packit url should be set in env var
server_url = os.getenv("PACKIT_E2E_BASE_URL")

# optionally set a personal access token in env var
# for running in CI without user interaction
pat = os.getenv("GITHUB_ACCESS_TOKEN")

token_header = packit_authorisation(server_url, pat)

# packit_authorisation returns a dict with "Bearer [token]" value, used for sending headers to packit.
# However, for the purposes of the e2e tests, we just need the [token] part, which will be passed to redirect url
token = token_header["Authorization"].split(" ")[1]

# write the token out to a file which the calling bash script will read
with open(".token", "w") as f:
    f.write(token)



