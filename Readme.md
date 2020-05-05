https://www.freecodecamp.org/news/creating-a-production-ready-webpack-4-config-from-scratch/
--------------------------------------------------------------------------------------------


(1) webpack and webpack-cli
===========================
npm install webpack webpack-cli --save-dev

if we give command : webpack
we can see dist folder and inside it main.js

we can change : <script src="./src/index.js"></script> to below :
<script src="./dist/main.js"></script>

(2) webpack.config.js
=====================
we can delete this => "test": "echo \"Error: no test specified\" && exit 1"
and add this => "build": "webpack --config=webpack.config.js"
and create a new file - "webpack.config.js" paralle to package.json and add below code :

npm install path --save

-------------------------------------
webpack.config.js
----------------
const path = require('path');

module.exports={
    entry:"./src/index.js",
    output:{
        filename:"main.js",
        path: path.resolve(__dirname,'dist')
    }
}
------------------------------------
command : npm run build 
dist folder will have main.js in minified form

if we change output in webpack.config.js as 
output:{
        filename:"final.js",
        path: path.resolve(__dirname,'output')
    }
and give command : npm run build
new folder output will be created with final.js inside it in minifed format
but now we need to change <script src="./dist/main.js"></script> to <script src="./output/final.js"></script>

We also see the old main.js file in our dist directory too! 
Wouldn't it be nice if webpack could delete the old unneeded output each time we do a new build?
for this we will use : "CleanWebpackPlugin" as in Step 3
Plugin :Webpack has a rich ecosystem of modules called "plugins", which are libraries that can modify and enhance the webpack build process.

(3) CleanWebpackPlugin
=========================
npm install --save-dev clean-webpack-plugin

so in webpack.config.js file we will add
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
and after output 
plugins:[
        new CleanWebpackPlugin()
    ]
if we give command : npm run build    
earlier output folder and file will be deleted

(4) HTMLWebpackPlugin
======================
Each time we change the output file name in our webpack.config.js file, we also have to change that file name we reference in our script tag in our index.html file. Wouldn't it be nice if webpack could manage that for us?
for this we will use "HTMLWebpackPlugin"

npm install --save-dev html-webpack-plugin

as of now index.html is paralle to src folder and package.json
let's move our index.html file inside our src directory so that it's a sibling to the index.js file
and we will delete script tag in index.html so that with use of HTMLWebpackPlugin, script tag gets added
as per the name of output file

so in webpack.config.js we will add :

const HtmlWebpackPlugin = require('html-webpack-plugin');

andin plugins, we will add :
 new HtmlWebpackPlugin({
            filename:'index.html',  //name of html file
            inject:true,            //if we wanna inject src tag
            template:path.resolve(__dirname,'src','index.html') /path of html
        })

command : npm run build 
if we see in dist folder index.html file(it will be in minified format), there will be script tag injected with main.js.

(5) Create a Development Server
================================
So we saw 2 plugins - CleanWebpackPlugin and the HtmlWebpackPlugin. As we have made these changes, we have to manually run the "npm run build" command each time to see new changes in our app. 
We have also just been viewing the file in our browser by double click rather than viewing the content served from a server running locally. Let's improve our process by creating a development server.

To do this, we'll use webpack-dev-server ==> npm install --save-dev webpack-dev-server

Also , let's split up our single webpack.config.js file into two separate config files, 
one for production and one for development. We'll call the file 
for production => webpack.config.prod.js 
for development webpack.config.dev.js.

for webpack dev file , we need to tell 3 things:
a) mode: 'development'
b) to webpack-dev-server installed above we need to tell from where to pick file for output so add :
    devServer: {
        contentBase: './dist',
    },
c) devtool: 'inline-source-map' => meaning that a source map is included at the end of each JavaScript file

So webpack file for dev is below :

webpack.config.dev.js
--------------------
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
  },
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      inject: true,
      template: path.resolve(__dirname, 'src', 'index.html'),
    }),
  ]
}

---------------


For webpack prod file we need to tell 2 things:
a)mode: 'production',
b)devtool: 'source-map' => we like the source-map option for source maps, which provides separate source map 
files for minified code

webpack.config.prod.js
----------------------

const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      inject: true,
      template: path.resolve(__dirname, 'src', 'index.html'),
    }),
  ]
}

in package,json we need this change:
"scripts": {
  "build": "webpack --config=webpack.config.prod.js",
  "build-dev": "webpack --config=webpack.config.dev.js",
  "start": "webpack-dev-server --config=webpack.config.dev.js --open"
}

command : npm run build => to see the production build output
we will see that the main.js file in your dist directory is minified and that it has an accompanying main.js.map source map file.

command : npm run build-dev => to see the development build output.
we will  see the main.js file in your dist directory, but now note that it is not minified

command : npm start => to start up the development server. This will open up the app on http://localhost:8080/. 
No more having to view the files directly by just pulling them into your browser! We now have a real live development server!

we wil make a small change to test that we dont need to give npm run build each time and also
browser should update itslef
In index.js change it from "Hello from webpack!" to => "Hello from dev server!"

with changes above, it will work

(6) WebpackMerge
================
we have two separate webpack config files, one for development and one for production, we can see that we have 
a lot of duplicated code between the two files.
So, how can we clean up the duplication in our webpack config files? There's a plugin for that!!!
We can use the webpack-merge plugin to manage shared code that multiple config files rely on. To do this, we'll first install the package:

npm install --save-dev webpack-merge

we'll create a third webpack config file called webpack.config.common.js. This is where we'll keep our shared code. Right now, our development and production config files share the same entry point, output, and plugins. All that differs between the two files are the mode, source map, and dev server.

webpack.config.common.js
------------------------
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      inject: true,
      template: path.resolve(__dirname, 'src', 'index.html'),
    }),
  ]
}


webpack.config.dev.js
---------------------
const merge = require('webpack-merge')
const commonConfig = require('./webpack.config.common')

module.exports = merge(commonConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
  },
})

webpack.config.prod.js
-----------------------
const merge = require('webpack-merge')
const commonConfig = require('./webpack.config.common')

module.exports = merge(commonConfig, {
  mode: 'production',
  devtool: 'source-map',
})

(7) Loaders
------------
In our src directory, let's create an index.css file and place the following lines of CSS inside it:
body {
  background: deeppink;
  color: white;
}
Then, in our ./src/index.js file, let's import that CSS file:
import './index.css'
command: npm start
we will see error :
-----------------------------------------------------------
ERROR in ./src/index.css 1:5
Module parse failed: Unexpected token (1:5)
You may need an appropriate loader to handle this file type
------------------------------------------------------------

for this we need "loaders".
Loader - help webpack know how to understand and load different file types. Out of the box, webpack understands how to handle our JavaScript files, but it doesn't know what to do with CSS files yet. Let's fix that.

StyleLoader and CSSLoader :
There are two loaders in particular that will be helpful for us here: style-loader and css-loader.
npm install --save-dev style-loader css-loader

we can add them to our webpack.config.common.js file in the module rules section down at the bottom
--------------------------------------------------------------------
  module: {
            rules: [
                        {
                            test: /\.css$/,
                            use: ['style-loader', 'css-loader']
                        }
            ]
  }
--------------------------------------------------------------------

This section sets up rules for webpack so it knows what to do with each file it encounters. The test property 
is a regular expression that webpack checks against the file name. In this case, we want to handle files 
with a .css extension.
The use property tells webpack what loader or loaders to use to handle files matching the criteria. 
Note that the order here matters!

Webpack loaders are read from right to left. So first the css-loader will be applied, and then the style-loader will be applied

Now, what do these loaders actually do for us?

css-loader interprets and resolves imported CSS files that you reference in your JavaScript. So in this case, css-loader helps make this line work => import './index.css'

style-loader injects the CSS into the DOM. By default, style-loader takes the CSS it encounters and adds it to 
the DOM inside a style tag.

if we give command : npm run build 
and then npm start
we can see index.css changes are applied

Now if we want SASS concepts then it will need sass-loader and this sass-loader needs node-sass

npm install --save-dev sass-loader node-sass

we change delete index.css file and create styles folder inside src folder and create a new file index.scss
and add below code :
index.scss
----------
$bg:blue;

body{
    background-color: $bg;
}

in webpack.config.common.js we will change below code
{
    test: /\.css$/,
    use: ['style-loader', 'css-loader']
}
to the code below:
{
    test:/\.scss$/, //bottom to top sass-load 
    use:["style-loader","css-loader","sass-loader"]
}

Note: "node-sass" is not there its only needed for sass-loader as mentioned above

so webpack.config.common.js file has code :

module: {
            rules: [                        
                        {
                            test:/\.scss$/,
                            use:["style-loader","css-loader","sass-loader"]
                        }
            ]
  }

now if we give nun run build and then npm start
we can see in browser scss file changes are reflectig 

(8) file loader
===============
npm install file-loader --save-dev
for this we need html loader as well
npm install --save-dev html-loader
in srv- crrate a images folder and put an image say "mountain.jpeg"

in src- index.html
<img src="./images/mountain.jpeg">

in webpack.config.common.js, add the below code to rules:
{
    test:/\.(png|svg|jpg|jpeg|gif)$/,
    use:['file-loader']
}

command : npm run build and then npm start
in browser we can see the image

(9) Babdel-loader
=================
Babel is a JavaScript compiler that can turn ES6+ code into ES5 code.
npm install --save-dev babel-loader @babel/core

in webpack.config.common.js
---------------------------
{
    test: /\.(js|jsx)$/,
    exclude: /[\\/]node_modules[\\/]/,
    use: {
      loader: 'babel-loader',
    },
},

This will tell webpack that when it encounters .js or .jsx files to use Babel to transform the code. We use the exclude property to make sure Babel doesn't try to transform JavaScript files in our node_modules directory

we'll add one more dependency for a Babel preset:
npm install --save-dev @babel/preset-env

we'll create a .babelrc file where we can do other Babel configuration as needed. We'll keep our file pretty simple and just specify the Babel preset that we want to use:

{
  "presets": ["@babel/preset-env"]
}

---------------------------------------------------------------
we will add some ES6 code in index.js - Rest/Spread operator as below :
index.js
--------
import './styles/index.scss';

const p = document.createElement('p')
p.textContent = "Hello from dev server!.!.!.!"
document.body.appendChild(p);


const p2 = document.createElement('p')
const numbers1 = [1, 2, 3, 4, 5, 6]
const numbers2 = [7, 8, 9, 10]
const numbers3 = [...numbers1, ...numbers2]
p2.textContent = numbers3.join(' ')
document.body.appendChild(p2)
---------------------------------------------------------------
if we give command: npm run build-dev and then npm start
it will show in browser 

(10) MiniCssExtractPlugin
==========================
Why MiniCssExtractPlugin needed ?
because of Temporarily Missing Styles:

If you disable the cache in your browser and reload the page for our demo app, you may notice a slight blip in which the page appears with just the un-styled HTML, and then the page takes css/styles are applied.

This behavior results from how style-loader works. As mentioned above, style-loader takes CSS and places it in a style tag in your HTML. Because of that, there's a brief period of time in which the style tag hasn't been appended yet!

Now, this is OK for a development environment, but we definitely wouldn't want this kind of behavior occurring in production. Let's fix that with "MiniCssExtractPlugin"

Rather than injecting CSS into our HTML as style tags, we can use the MiniCssExtractPlugin to generate separate CSS files for us. We'll use this in our production config while still just using style-loader in our development config.

npm install --dev-save mini-css-extract-plugin

Now in our webpack.config.common.js file let's remove the CSS rule since we'll be handling this differently in development and production. 

we will cut the below code :
--------------------------------------------------------------
{
    test:/\.scss$/,
    use:["style-loader","css-loader","sass-loader"]
},
--------------------------------------------------------------                          
and need to add this in webpack.config.dev.js as below:
---------------------------------------------------------
 module: {
    rules: [
      {
        test: /\.scss$/,
        use: ["style-loader","css-loader","sass-loader"]
      },
    ]
  }
---------------------------------------------------------

for  webpack.config.prod.js file, let's add in our new mini-css-extract-plugin:
This "mini-css-extract-plugin" is a little different because it actually is both a plugin and a loader, so 
it goes in the module rules and in the plugins sections
--------------------------------------------------------
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module: {
      rules: [
                {
                  test: /\.scss$/,
                  use: [
                      MiniCssExtractPlugin.loader,
                      'css-loader',
                      ],
                },
            ],
        },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
  ]
-----------------------------------------------------------  

Also here we used the square brackets in our file name to dynamically set the name to the original source 
file's name and also include the contenthash, which is a hash (an alphanumeric string) that represents the 
file's contents

Since we cut the below code (read above)
{
    test:/\.scss$/,
    use:["style-loader","css-loader","sass-loader"]
},
from webpack.config.common.js and put in webpack.config.dev.js so 
for npm run build-dev it willwork as earlier only

for webpack.config.prod.js we wrote code for "MiniCssExtractPlugin" so if we give
command : npm run build
we can see in cmd
-----------------------------------------------------
Built at: 05/01/2020 7:57:18 PM
                                Asset       Size  Chunks                         Chunk Names
4652a3f9b8ef1c699398c092bc33d066.jpeg    6.2 KiB          [emitted]
                           index.html  355 bytes          [emitted]
        main.c6478e2b9ceba9274558.css  107 bytes       0  [emitted] [immutable]  main
    main.c6478e2b9ceba9274558.css.map  243 bytes       0  [emitted] [dev]        main
                              main.js   1.21 KiB       0  [emitted]              main
                          main.js.map   5.28 KiB       0  [emitted] [dev]        main
Entrypoint main = main.c6478e2b9ceba9274558.css main.js main.c6478e2b9ceba9274558.css.map main.js.map
[0] ./src/index.js 385 bytes {0} [built]
[1] ./src/styles/index.scss 39 bytes {0} [built]
    + 1 hidden module
Child HtmlWebpackCompiler:
                                    Asset     Size  Chunks             Chunk Names
    4652a3f9b8ef1c699398c092bc33d066.jpeg  6.2 KiB          [emitted]
-----------------------------------------------------
So here it actually generates a CSS file now, and the content hash is included in the file name.

Hence,problem solved! No more blip when the page loads in production since we have the styles included as a link tag to an actual CSS file


(11) Cache Busting
==================
Since we've included the content hash in the generated CSS file, now is a good time to talk about cache busting. Why do we want the content hash included in our file names? 
Ans : To help the browser understand when a file has changed!
--------------------------------------------------------
Browser tries to be helpful by caching files it has seen before. For example, if we have visited a website, and  browser had to download assets like JavaScript, CSS, or image files, the browser may cache those files so that it doesn't have to request them from the server again.

This means that if you visit the site again, your browser can use the cached files instead of requesting them again, so you get a faster page load time and a better experience.

So, what's the problem here? Imagine if we had a file called main.js used in our app. Then, a user visits your app and their browser caches the main.js file.

Now, at some later point in time, you've released new code for your app. The contents of the main.js file have changed. But, when this same user visits your app again, the browser sees that it needs a main.js file, notes that it has a cached main.js file, and just uses the cached version. The user doesn't get your new code!

To solve this problem, a common practice is to include the content hash in each file's name. As discussed earlier, the content hash is a string representation of the file's contents. If the file's contents don't change, the content hash doesn't change. But, if the file's contents do change, then the content hash also changes.

Because the file name will now change when the code changes, the browser will download the new file since it 
won't have that specific file name in its cache
--------------------------------------------------------

To include the content hash in our JavaScript file names, we will modify just one line of code in 
our file "webpack.config.common.js" file. 

This line: => filename: 'main.js'
Will change to this line => filename: '[name].[contenthash].js'

so the change in webpack.config.common.js is :
  output: {
//  filename: 'main.js',
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist')
  },

Since we have made above changes to include hash in name of output js file so now if we give
command : npm run build-dev
we will see like:
---------------------------------------------------------------------------------------------
Built at: 05/01/2020 11:32:51 PM
                                Asset       Size  Chunks                         Chunk Names
4652a3f9b8ef1c699398c092bc33d066.jpeg    6.2 KiB          [emitted]
                           index.html  319 bytes          [emitted]
         main.b57e539a2a82e8e61f81.js   39.3 KiB    main  [emitted] [immutable]  main
Entrypoint main = main.b57e539a2a82e8e61f81.js
[./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/styles/index.scss] 303 bytes {main} [built]
[./src/index.js] 385 bytes {main} [built]
[./src/styles/index.scss] 569 bytes {main} [built]
    + 2 hidden modules
Child HtmlWebpackCompiler:
                                    Asset     Size  Chunks             Chunk Names
    4652a3f9b8ef1c699398c092bc33d066.jpeg  6.2 KiB          [emitted]
---------------------------------------------------------------------------------------------
see the name of JS fiel is hashed

if we give command: npm start
we can see changes in browser

(12) Minifying CSS
===================
We were already minifying our JavaScript for the production build, but we're not minifying our CSS yet.
We can minimize our CSS by using the "optimize-css-assets-webpack-plugin".

npm install --save-dev optimize-css-assets-webpack-plugin

webpack.config.prod.js
----------------------
After plugins we will add below code :
-------------------------------------
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')

optimization: {
    minimizer: [
      new OptimizeCssAssetsPlugin({
        cssProcessorOptions: {
          map: {
            inline: false,
            annotation: true,
          },
        },
      }),
    ],
  },
-------------------------------------
Now if we give command : npm run build

We can see in the contents of our dist directory, we can see that the resulting CSS is minified

Note: If we look at our resulting JavaScript file, it's not minified! 
But it was minified before, so what happened here?

The issue is that we are now manually configuring the optimization minimizer section of our webpack config. When that section isn't in the webpack config file, webpack defaults to using its own minimizer preferences, which includes minifying JavaScript when the mode is set to production.

Since we're now overriding those defaults by adding in our preferences for minifying CSS assets, we'll need to also explicitly include instructions for how we want webpack to minify JavaScript assets

for this we will use - TerserWebpackPlugin

npm install --save-dev terser-webpack-plugin

In our webpack.config.prod.js file, let's add the terser-webpack-plugin to our optimization minimizer settings at the bottom of the file
---------------------------------------------------------------------------
define at  top=> const TerserPlugin = require('terser-webpack-plugin')

use at bottom:
new TerserPlugin({
        // Use multi-process parallel running to improve the build speed
        // Default number of concurrent runs: os.cpus().length - 1
        parallel: true,
        // Enable file caching
        cache: true,
        sourceMap: true,
      }),
---------------------------------------------------------------------------------      

Now if we give command : npm run build
we can see at the output in the dist directory, we should see that both our CSS files and our JavaScript files are minified

-------------------------------------------------------------------------------------------------
Built at: 05/02/2020 12:42:33 AM
                                Asset       Size  Chunks                         Chunk Names
4652a3f9b8ef1c699398c092bc33d066.jpeg    6.2 KiB          [emitted]
                           index.html  376 bytes          [emitted]
        main.f2003fe45adf78bf8702.css  103 bytes       0  [emitted] [immutable]  main
    main.f2003fe45adf78bf8702.css.map  333 bytes          [emitted]
         main.f560c3541220e82a40f3.js   1.23 KiB       0  [emitted] [immutable]  main
     main.f560c3541220e82a40f3.js.map    5.3 KiB       0  [emitted] [dev]        main
Entrypoint main = main.f2003fe45adf78bf8702.css main.f560c3541220e82a40f3.js main.f560c3541220e82a40f3.js.map
[0] ./src/index.js 385 bytes {0} [built]
[1] ./src/styles/index.scss 39 bytes {0} [built]
    + 1 hidden module
Child HtmlWebpackCompiler:
                                    Asset     Size  Chunks             Chunk Names
    4652a3f9b8ef1c699398c092bc33d066.jpeg  6.2 KiB          [emitted]
--------------------------------------------------------------------------------------------------

thats all 