import { CliArguments } from './cli.ts'
//The ensureDir function from the fs module (version 0.144.0) in the std library. 
//ensureDir is a utility function that creates a directory if it doesn't already exist, 
//similar to mkdir -p in Unix-based systems.
import { ensureDir } from 'https://deno.land/std@0.144.0/fs/mod.ts'
import { join } from 'https://deno.land/std@0.144.0/path/mod.ts'
import { JobPostingInfo } from './jobWorker.ts'

export interface JobPosting {
  title: string
  externalPath: string
  locationsText: string
  postedOn: string
  bulletFields: string[]
  _fullUrl?: string
}

export interface JsonResponseBody {
  total: number
  jobPostings: JobPosting[]
}

export interface RequestInput {
  appliedFacets: object
  limit: number
  offset: number
  searchText: string
}

export const getJobPostings = async ({ url, dest, threads, verbose, searchkeywords} : CliArguments) : Promise<void> =>
{
  // log progress if verbose flag is set
  verbose && console.log('Scraping list of all job postings..')
  
  // get the list of all job postings
  
  //测试代码，看一看，无法爬虫的网址发生了什么，替代下面前三行代码

  // const input: RequestInput = {appliedFacets: {}, limit: 20, offset: 0, searchText: ''};
  // const response = await getListUrlContents(url, input);

  // if (verbose) {
  //     console.log(response);
  // }

  // const { jobPostings = [] } = response || {};

  const input : RequestInput = {appliedFacets: {}, limit: 20, offset: 0, searchText: searchkeywords}
      , response = await getListUrlContents(url, input)//getListUrlContents方法在下方有定义
      , { jobPostings=[] } = response || {}
  
  // log the number of job postings found, if verbose flag is set
  verbose && console.log(`There are ${jobPostings.length} job postings.`)
  verbose && console.log('Scraping full descriptions of each job posting..')

  // return if there are no job postings
  if ( 0 == jobPostings.length)
    return

  // generate full URLs for each job posting
  for ( let i=0; i<jobPostings.length; i++ ) {
    const urlObj = new URL(url)
    //console.log(url)
    //console.log(urlObj.origin)
    //console.log(urlObj.pathname)
    //新声明_fullUrl性质变量
    jobPostings[i]._fullUrl = [urlObj.origin, urlObj.pathname].join('')
      .replace(/\/jobs\/{0}$/g, jobPostings[i].externalPath)
    //console.log(jobPostings[i].externalPath)
    console.log(jobPostings[i]._fullUrl)
  }

  //create the destination folder if it doesn't exist
  await ensureDir(dest)

  // run with --no-check if deno takes longer to re-check the worker file on every worker invocation
  // scrape each job posting using worker threads
  //i += threads 就是 i = i + threads
  for (let i=0; i<jobPostings.length; i+=threads) {
    const jobs = jobPostings.slice(i, i+threads).map((post,i) =>
    {
      return new Promise<JobPostingInfo|undefined>(resolve =>
        {
          const worker = new Worker(new URL('./jobWorker.ts', import.meta.url).href, { type: 'module' })
          //console.log(import.meta.url)
          //console.log(new URL('./jobWorker.ts', import.meta.url).href)
          worker.postMessage(post)
          //这里可以改名把data叫做shuju
          worker.onmessage = ({ data } : { data: JobPostingInfo|undefined }) => resolve(data)
        })
    })
    
    // write the job information to file
    //jobs是上面的const jobs
    //PromiseFulfilledResult   https://javadoc.io/static/co.fs2/fs2-io_sjs1_3/3.0-27-095de6c/api/fs2/internal/jsdeps/std/PromiseFulfilledResult.html
    const results = (await Promise.allSettled(jobs)) as PromiseFulfilledResult<any>[]

    const writes: Promise<void>[] = []
    
    results.forEach((res) => writes.push(new Promise<void>(async resolve =>
    {
      const info = res.value as JobPostingInfo|undefined

      if ( ! info || ! info.id )
        return void resolve()

      const jobfile = join(dest, info.id.concat('.json'))
      await Deno.writeTextFile(jobfile, JSON.stringify(info))

      resolve()
    })))

    await Promise.allSettled(writes)
  }
   // log completion if verbose flag is set
  verbose && console.log(`Done. All files stored under ${dest}`)
}

export const getListUrlContents = ( url: string, input: RequestInput ) : Promise<JsonResponseBody|undefined> =>
  fetch(url, {
    method: 'POST',
    headers: {
      'accept': 'application/json,application/xml',
      'content-type': 'application/json',
    },
    body: JSON.stringify(input),
  })
    .then(res => res.json())
    .catch(err => void console.error(err) || undefined)
