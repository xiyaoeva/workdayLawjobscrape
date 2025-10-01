import { dirname } from 'https://deno.land/std@0.144.0/path/mod.ts'
//导入cli方法 CLI（command-line interface，命令行界面）
import cli from './src/cli.ts'

//The await keyword is used to wait for the cli function to complete 
//before continuing with the next line of code.
await cli(dirname(new URL('', import.meta.url).pathname))
/*new URL('', import.meta.url).pathname: 
This creates a new URL object with an empty string as the first argument 
and the import.meta.url value as the second argument. 
(import.meta.url - 它表示浏览器中模块的绝对URL或Node.js中的绝对路径（前缀为 file:// ）)
The import.meta.url value is a special URL that represents the URL of the current module. 
The .pathname property of the URL object returns the path portion(部分) of the URL.*/