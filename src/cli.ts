
//The Command class from the cliffy module (version 0.24.2), 
//which provides a framework for building command-line interfaces (CLIs) in Deno.
import { Command } from 'https://deno.land/x/cliffy@v0.24.2/command/mod.ts'
//The join function from the path module (version 0.144.0) in the std library, 
//which is a standard library provided by Deno that includes a number of useful utilities 
//for working with file paths and other file system operations.
import { join } from 'https://deno.land/std@0.144.0/path/mod.ts'
//getJobPostings function
import { getJobPostings } from './crawler.ts'

//This is a TypeScript interface definition for a set of CLI arguments that a program or script may accept.
export interface CliArguments {
  //url a required string property that represents the URL to be downloaded.
  url: string
  //dest a required string property that represents the destination file path where the downloaded file will be saved.
  dest: string
  //threads a required numeric property that represents the number of threads to use for downloading the file.
  threads: number
  //verbose an optional boolean property that, if provided, enables verbose output during the download process.
  verbose?: boolean
  //The ? symbol after verbose indicates that this property is optional. 
  //verbose is an optional property that controls whether the program outputs additional information during the download process. 
  //If verbose is true, the program may output more detailed information about what it is doing, such as the current download progress or any errors that occur.
  searchkeywords: string
}

export default ( baseDir: string ) => new Command()
  .name('Workday web crawler')
  .version('0.1')
  .description('Workday web crawler CLI')
  .option('-u, --url <url:string>', 'Job Posting URL', {
    default: 'https://wd3.myworkdaysite.com/wday/cxs/mdlz/External/jobs',
    //default: 'https://svb.wd5.myworkdayjobs.com/wday/cxs/svb/svbank/jobs' as const,
    //default: 'https://oxford.wd5.myworkdayjobs.com/wday/cxs/oxford/LillyPulitzer/jobs' as const,
    //default: 'https://oregon.wd5.myworkdayjobs.com/wday/cxs/oregon/SOR_External_Career_Site/jobs' as const,
    //default: 'https://7eleven.wd3.myworkdayjobs.com/wday/cxs/7eleven/7eleven/jobs' as const,
    //default: 'https://hoganlovells.wd3.myworkdayjobs.com/wday/cxs/hoganlovells/Search/jobs' as const,
    //default: 'https://pvh.wd1.myworkdayjobs.com/wday/cxs/pvh/PVH_Careers/jobs' as const,
    //default: 'https://mastercard.wd1.myworkdayjobs.com/wday/cxs/mastercard/CorporateCareers/jobs' as const,
    required: true,
  })
  .option('-d, --dest <dest:string>', 'Destination Directory', {
    default: './test' as const,
    required: true,
  })
  .option('-t, --threads <threads:number>', 'Number of parallel threads', {
    default: 4 as const,
    required: true,
  })
  .option('-v, --verbose', 'Verbose output to sdout')
  //options这个变量名字可以随意变，只要和后面一致即可
  .option('-k, --searchkeywords <searchkeywords:string>', 'Search Key Word', {
    default: '' as const,
    //default: 'legal' as const,
    required: true,
  })
  .action((options) =>
  {
    const { url, dest, threads, verbose=false, searchkeywords} : CliArguments = options

    if ( threads <= 0 )
      throw Error('threads value cannot be less than/equal to zero')

    getJobPostings({ url, dest: join(baseDir, dest), threads, verbose, searchkeywords})
  })
  .parse(Deno.args)



/*
In this context, threads is a numeric property that specifies the number of threads to be used for downloading the file.

A thread is a sequence of instructions that can be executed independently of the rest of the program. 
In the context of downloading a file, using multiple threads allows the program to download different parts of the file concurrently, which can increase the overall download speed.

For example, if a file is being downloaded in 4 threads, the program may divide the file into 4 parts and download each part separately using a separate thread. Once all parts have been downloaded, the program can combine them into a single file.

The optimal number of threads to use depends on various factors such as the size of the file, the network bandwidth, and the hardware capabilities of the computer running the program. Using too many threads can lead to decreased performance due to increased overhead, while using too few threads may not take full advantage of available network bandwidth. Therefore, it is usually best to experiment with different thread counts to find the optimal value for a given situation.
*/