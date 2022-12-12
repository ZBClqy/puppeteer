const puppeteer=require('puppeteer')
const fs=require('fs')

async function screen(){
        let browser=await puppeteer.launch({headless:false, args: ['--start-maximized']})
        const page =await browser.newPage();
        const winSize= {width:1920,height:1080}
        let test;

        page.setViewport(winSize)


        await page.goto('https://juejin.cn/');

        
        let title=await page.title();
        console.log(title)
        
        let eleObj=await regularMatching(page,"\[\\w\\W\]*nav\[\\w\\W\]*")
        if(!eleObj){
            eleObj=await regularMatching(page,"\[\\w\\W\]*menus\[\\w\\W\]*")
        }
        console.log(eleObj)
        if(eleObj){
                test=await lookUpLink(page,eleObj.name)
             
                let index=0
                let timer=setInterval(async()=>{
                    if(index>=2){
                        fs.writeFileSync('index.json',JSON.stringify(test),(err)=>{
                            console.log(err)
                        })
                        clearInterval(timer)
                    }else{
           
                        await page.goto(test[index].link)
                        let eleObjs=await regularMatching(page,"\[\\w\\W\]*content\[\\w\\W\]*")
                        if(!eleObjs){
                            eleObjs=await regularMatching(page,"content")
                        }
                        if(eleObjs){
                        await new Promise((resolve)=>{
                                setTimeout(() => {
                                    resolve()
                                }, 1000);
                        })
                        let tests=await lookUpLink(page,eleObjs.name)
                    
                        console.log(tests)
                        test[index].children=tests
                            let i=0
                            let timers=setInterval(async()=>{
                                if(i>=tests.length){
                                    clearInterval(timers)
                                }else{
                                    await page.goto(tests[i].link)
                                    let eleObjs=await regularMatching(page,"\[\\w\\W\]*content\[\\w\\W\]*",true)
                                    if(!eleObjs){
                                        eleObjs=await regularMatching(page,"content",true)
                                    }
                                    
                                    if(eleObjs){
                                        let tes=await lookUpText(page,eleObjs.name)
                                        tests[i].html=tes
                                    }
                                }
                                i++
                            },50000)
                        } 
                    }
                    index++
                },50000)
           
            
        }

     

  
}
// let exp2=/[\w\W]*menus[\w\W]*/ig
screen()

async function regularMatching(page,str,flag=false){
    return await page.evaluate(({str,flag})=>{
        let divs= document.body.querySelectorAll('div')
        if(flag){
            divs=[...document.body.querySelectorAll('main'),...divs,...document.body.querySelectorAll('section')]
        }else{
            divs=[...divs,...document.body.querySelectorAll('section'),...document.body.querySelectorAll('main')]
        }
        let exp=new RegExp(str,"gi")
        for(let i=0;i<divs.length;i++){
            if(exp.test(divs[i].className)){
                if(document.querySelector(`.${divs[i].className.split(' ')[0]}`).querySelectorAll('a').length>=1){
                    return{
                        name:divs[i].className.split(' ')[0]
                    }
                }
            }
        }
    },{str,flag})
    
}

async function lookUpLink(page,name){
    return await page.$eval(`.${name}`,(ele)=>{
            let arrs=[]

            let arr= ele.querySelectorAll('a')

            for(let i=0;i<arr.length;i++){
                arrs.push({text:arr[i].innerText,link:arr[i].href})
            }

        
       
            return arrs
    })
}

async function lookUpText(page,name){
    return await page.$$eval(`.${name}`,(ele)=>{
        let arr=[]
        for (let index = 0; index < ele.length; index++) {
            arr.push(ele[index].innerHTML)
        }
        return arr
    })
}