package packit.security.ott

// A matcher for /packets/{id}/file and /packets/{id}/files/zip
val OTT_ENDPOINTS_REGEX = Regex("/packets/[^/]+/(file|files/zip)")
