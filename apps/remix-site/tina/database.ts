import { createDatabase, createLocalDatabase } from '@tinacms/datalayer'

// Change this to your chosen git provider
// 因為他的 package.json 是用 next 的哭夭 compiler 弄的，不符合 vite 的標準（這才是 ESstandard），所以要直接 import 他的 dist 裡面的檔案
import GitHubProviderPkg from 'tinacms-gitprovider-github/dist'
const { GitHubProvider } = GitHubProviderPkg;

// Change this to your chosen database adapter
import { Redis } from '@upstash/redis'
// 這裡也是，他不是 module
import RedisLevelPkg from 'upstash-redis-level';

const { RedisLevel} = RedisLevelPkg

// Manage this flag in your CI/CD pipeline and make sure it is set to false in production
const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === 'true'

const branch =
  process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || 'main'

if (!branch) {
  throw new Error(
    'No branch found. Make sure that you have set the GITHUB_BRANCH or process.env.VERCEL_GIT_COMMIT_REF environment variable.'
  )
}

// Temporary use the non-null assertion here, maybe it would be better to make a check in production
const REPO = process.env.GITHUB_REPO!
const OWNER = process.env.GITHUB_OWNER!
const TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN!

export default isLocal
  ? // If we are running locally, use a local database that stores data in memory and writes to the locac filesystem on save
    createLocalDatabase()
  : // If we are not running locally, use a database that stores data in redis and Saves data to github
    createDatabase({
      // May very depending on your git provider
      gitProvider: new GitHubProvider({
        repo: REPO,
        owner: OWNER,
        token: TOKEN,
        branch,
      }),
      // May very depending on your database adapter
      databaseAdapter: new RedisLevel<string, Record<string, any>>({
        redis: new Redis({
          url:
            (process.env.KV_REST_API_URL as string) || 'http://localhost:8079',
          token: (process.env.KV_REST_API_TOKEN as string) || 'example_token',
        }),
        debug: process.env.DEBUG === 'true' || false,
        namespace: branch,
      }),
    })