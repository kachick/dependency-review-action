import * as core from '@actions/core'
import parse from 'spdx-expression-parse'
import * as z from 'zod'
import {ConfigurationOptions, SEVERITIES} from './schemas'

function getOptionalInput(name: string): string | undefined {
  const value = core.getInput(name)
  return value.length > 0 ? value : undefined
}

function parseLicenses(ids: string | undefined): string[] | undefined {
  return ids?.split(',').map(x => {
    const id = x.trim()
    try {
      parse(id)
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.match(/Unexpected \S+ at offset/)
      ) {
        throw new Error(
          `given an unknown spdx_id \`${id}\`, you can only choose ids from https://docs.github.com/en/rest/licenses`
        )
      }
    }
    return id
  })
}

export function readConfig(): ConfigurationOptions {
  const fail_on_severity = z
    .enum(SEVERITIES)
    .default('low')
    .parse(getOptionalInput('fail-on-severity'))
  const allow_licenses = getOptionalInput('allow-licenses')
  const deny_licenses = getOptionalInput('deny-licenses')

  if (allow_licenses !== undefined && deny_licenses !== undefined) {
    throw new Error("Can't specify both allow_licenses and deny_licenses")
  }

  return {
    fail_on_severity,
    allow_licenses: parseLicenses(allow_licenses),
    deny_licenses: parseLicenses(deny_licenses)
  }
}
