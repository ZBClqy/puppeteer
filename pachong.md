# puppeteer

首先要写一个pc我们可以使用我们的puppeteer，它是由谷歌创建的可以对浏览器的开发者工具内的内容进行读取等一系列操作

首先我们安装puppeteer

yarn add puppeteer

然后开始写我们正式的内容

const puppeteer = require('puppeteer')

const fs=require('fs')

async function screen(){

​	//这里我们实例化一个浏览器对象使用我们的launch，它可以传入一个配置对象，这里我们配置headless：false打开浏览器然后配置args:['--start-maximized']使得我们的浏览器最大化

​	let browser = new puppeteer.launch({ headless:false,args:['--start-maximized'] })

​	//这里创建一个新的页面对象

​	const page=await browser.newPage()

​	这里定义一个默认页面的显示区的大小

​	const winSize={width:1920,height:1080}		

​	page.setViewport(winSize)

​	使用页面的title方法可以拿到页面的标题

​	let title=await page.title();

​	这里输入我们的正则字符串去搜索可能的元素

​	let eleObj=await regularMatching(page,"\[\\w\\W\]*nav\[\\w\\W\]*")	

​	如果没找到就换一个正则进行尝试	

​	if(!eleObj){

​		eleObj=await regularMatching(page,"\[\\w\\W\]*menus\[\\w\\W\]*")

​	}

​	if(eleObj){

​		test=await lookUpLink(page,eleObj.name)

​		let index=0

​		let timer=setInterval(async()=>{

​			if(index>=test.length){

​					fs.writeFileSync('index.json',JSON.stringify(test),(err)=>{

​						console.log(err)

})

​			clearInterval(timer)

}else{

​			await page.goto(test[index].link)

​			 let eleObjs=await regularMatching(page,"\[\\w\\W\]*content\[\\w\\W\]*")

​            if(!eleObjs){

​              eleObjs=await regularMatching(page,"content")

​            }

​			 if(eleObjs){

​            let tests=await lookUpLink(page,eleObjs.name)

​			test.children=tests

}

})

}

}



//然后我们自定义一个方法来去获取我们想要的dom元素

async function regularMatching(page,str,flag=false){

​	page.evaluate可以帮助我们运行我们的js脚本里面去操作dom

​	return await page.evaluate(({str,flag})=>{

​			我们直接获取页面内所有可能的元素进行匹配

​			let divs=document.body.querySelectorAll('div')

​			if(flag){

​					divs=[...document.body.querySelectorAll('main'),...divs,...document.body.querySelectorAll('section')]

​			}else{

​					divs=[...divs,...document.body.querySelectorAll('div'),...document.body.querySelectorAll('section')]

​			}

​			通过传入的字符串创建一个正则去匹配每个元素

​			let exp=new RegExp(str,"gi")

​			for(let i=0;i<divs.length;i++){

​					if(exp.test(divs[i].className)){

​						因为我们这个主要是寻找页面的标签元素然后去跳转 所以我们还需要看一下我们最终找到的元素内是否包含a标签，如果未包含肯定不是我们要的元素

​						if(document.querySelector(`.${divs[i].className.split(' ')[0]}`).querySelectorAll('a').length>1){

​								return{

​										name:divs[i].className.split(' ')[0]

}

}				

}

}

},{str,flag})

}



async function lookUpLink(page,name){

​		page.$eval 可以帮助我们获取dom元素并操作读取dom的属性

​		return await page.$eval(`.${name}`,(ele)=>{

​			let arrs=[]

​			let arr=ele.querySelectorAll('a')

​			for(let i=0;i<arr.length;i++){

​				arrs.push({text:arr[i].innerText,link:arr[i].href})

}

​		return arrs

})

}