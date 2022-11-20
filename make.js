const { compile } = require('nexe')


compile({
  input: './index.js',
  build: true, //required to use patches
  resource: [
    './local.*',
  ],
  output: './dist/wibb'
})
.then(() => {
  // const fs = require('fs')
  
  console.log('build successful')
  
  // fs.copyFile('spectrum_core', '../core', err=>{
  //   if (err) throw err
    
  //   console.log('core copied ..')
  // })
})
.catch(console.error)