# Packit testDeviceFlow

This node app allows manual testing of device flow in Packit. It provides an example of logging a user in via device
flow which can be replicated in orderly2, and other device flow clients. 

Device flow should work with all Packit auth methods (basic, github and preauth/Montagu).

To run against local Packit: `npm run test-local`.

To run against any Packit instance (you will be prompted for Packit base url): `npm run test`. 