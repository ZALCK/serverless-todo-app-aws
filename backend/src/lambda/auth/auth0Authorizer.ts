import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
//import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
//import Axios from 'axios'
//import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set

const jwksUrl = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJAuuRiUUCp6bnMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi0zbm02Z2hpdS51cy5hdXRoMC5jb20wHhcNMjIxMDE0MTkyNTIyWhcN
MzYwNjIyMTkyNTIyWjAkMSIwIAYDVQQDExlkZXYtM25tNmdoaXUudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqoiJ9Oc86vutF9a4
ggm46OPY7oESBnnqNX4CA0UWx7RpB4hf3baTPP0AR0VdWJvbun8NM9BHw1XcD+kv
esRueswT4LfypxFJ1+pL2PCZ1lfZRPuMamW3ysOhWI+p7bFICqL2mOZ+TQZES7eV
0Tn7nZ+rhXTmkJfgX+zrOmTOvBNfPiyf1GhUG21jTC1ge3KBZjVMpZ+WnHzs5LYk
ogl3FiHR/Ks8a7XHxiyG7e1MDLeZ7/lVcCTJvh+iI4ZGmiuQSauVma49nEH0HaRP
JhGDeGHWDvU1nGpAt+QMkp26M1zvkMGPNAVdUqn4T1j5YGheWnX4j4QCcq7LmvTc
SP5BjwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSzEh0i9NIH
E8VsjAKpSqJkbs+S2jAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AH9s9jlLkkXRdKMB9tkQxpRTD+Sryx7EzogqPY73c6gVs3mRUA+0GI89d400lLB3
HQZcQ01G1vwewrrTHb8Agb3Qlkm/fJ4WlKIdwQSlGDGf1oBXPf6W2s/pDBtmDDv0
mC1QaLVYEEE2iI7HUT/p2vLIPgySsZC5PqB5sMeVFWOSmCx0H2e0Z/waEoY5A8QA
V2nvh/7zwhwCyffi/1pvbH0YP1LBuZUb12+rcTXmNPh4HSKLdhD1D///lYb8GTf/
RYYSDi+Ooob0TpPAK6Ot+EGy7EL1RdAQtVRxHtwPDOdtu2GWc4OXeEHyUU7hbIPO
hANEzUAlHPCBfuS3ZvmAGAE=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  //const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, jwksUrl, { algorithms:['RS256'] }) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
