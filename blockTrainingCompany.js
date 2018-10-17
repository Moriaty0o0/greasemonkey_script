// ==UserScript==
// @name         blockTrainingCompany
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  让那些培训机构见鬼去吧！！！
// @author       拐子

// @match          *://sou.zhaopin.com/*
// @match          *://jobs.zhaopin.com/*
// @match          *://search.51job.com/*
// @match          *://jobs.51job.com/*

//@icon            https://www.easyicon.net/api/resizeApi.php?id=1072881&size=32

// @grant             GM_setValue
// @grant             GM_getValue
// @grant             GM_deleteValue
// @grant             GM_addStyle

//@license GLWTPL许可证
// ==/UserScript==

'use strict';

class BlockCompany{
    constructor(company_list){
        this._company_list= company_list;
    }

    //item_selector 设定删除页面中标签的选择器
    //title_selector用于获取页面中培训公司的名字
    //page_change_selector 如果页面是异步加载的话，用于监视页面变化，从而重新添加删除符号
    setSelector(item_selector, title_selector, page_change_selector){
        this._item_selector = item_selector;
        this._title_selector = title_selector;
        this._page_change_selector=page_change_selector;
    }

    _blockByList(){
        let titles = $(this._title_selector).get();
        for(let company of this._company_list){
            for(let title of titles){
                if(title["title"] == company){
                    //this._blockByTitle(title)
                    $(title).closest(this._item_selector).hide();
                }
            }
        }
    }

    _blockByTitle(company){
        let titles = $(this._title_selector).get();
        for(let title of titles){
            if(title["title"] == company){
                $(title).closest(this._item_selector).hide(500);
            }
        }
    }

    _addBlockSymbol(){
        let titles = $(this._title_selector).get();
        let self = this;
        for(let title of titles){
            let has_symbol = $(title).prev().filter(".block").length > 0;
            if(! has_symbol){
                $(title).before('<a href="javascript:;" class="block" style="color: blueviolet;">[X]</a>');
                $(title).prev().filter(".block").bind("click",function(){
                    //let company = $(this).next().attr("title");
                    let company = $(title).attr("title");
                    self._company_list.push(company);
                    GM_setValue("list", JSON.stringify(self._company_list));
                    self._blockByTitle(company);
                });
            }
        }

    }

    _addPageChangeListener(){
        let self=this;
        let options ={
            "childList":true
        };
        let observer = new MutationObserver(function(){
            self._blockByList();
            self._addBlockSymbol();
        });

        observer.observe($(this._page_change_selector).get(0),options);
    }

    _showCompanyList(){

    let self=this;

    let frame = $('<div class="main_frame" style="position: fixed; width: 520px; height:50%;top: 30%; bottom: auto; left:30%; right: auto; visibility: visible; z-index: 103;background:white;"></div>');
    let background=$('<div class="block_mask"style="position: fixed; left: 0px; top: 0px; z-index: 102; background: rgb(0, 0, 0); opacity: 0.5; width: 100%; height: 100%;"></div>');
    let info = $('<div class="block_company" style="height:80%;overflow: auto;"></div>');
    let del_symbol = $('<p style="text-align:right"><button style="background:white;font-size:2em;">[X]</button></p>');

    frame.append(del_symbol);
    for (let company of self._company_list){
        info.append("<p style='margin:1em 1em;'><span style='cursor:pointer;'>"+company+"</span></p>");
    }
    frame.append(info);

    $("body").append(background);
    $("body").append(frame);
    $(".block_company p span").bind("click",function(){
        let index = self._company_list.indexOf($(this).text());
        self._company_list.splice(index, 1);
        GM_setValue("list", JSON.stringify(self._company_list));
        $(this).parent().hide(300);
    });
    del_symbol.bind("click",function(){
        frame.remove();
        background.remove();
    });
    }

    main(){
        if(this._item_selector == "" || this._title_selector==""){
            console.log("must set title selector and item selector before running main");
        }
        else{
            this._blockByList();
            this._addBlockSymbol();
            if(this._page_change_selector!=""){
                this._addPageChangeListener();
            }

            var showButton = $('<button type="button"style="position: fixed;top:10%;left:5%;z-index: 101;width:4em;height:4em;background:#1787fb;color:white; border-radius:2em;">黑名单</button>');
           $("body").append(showButton);
           let self=this;
            showButton.bind("click",function(){
                self._showCompanyList();
            }); 
        }
    }
}
$(window).load(function(){
    const items=[
        "深圳市一风行科技有限公司",
        "深圳市麦亲科技有限公司",
        "河南云和数据信息技术有限公司深圳分公司",
        "深圳市云联时空科技有限公司",
        "深圳市时空数通科技有限公司",
        "深圳市惠科软件开发有限公司",
        "深圳市融联辉科技有限公司",
        "深圳万德菲电子商务有限公司",
        "深圳堉云信息技术有限公司",
        "深圳市斯密达网络科技开发有限公司",
        "深圳市互联安达科技有限公司",
        "深圳语风科技有限公司",
        "深圳七啸科技有限公司",
        "深圳市瑞滋德科技有限公司"
    ];

    const pre_list=JSON.parse(GM_getValue('list',"[]"));
    const list = pre_list.length ? pre_list : items;
    
    let host = window.location.host;


    let pattern =[ 
                    ["sou.zhaopin.com",[".contentpile__content__wrapper",
                                        ".commpanyName a:last-child",
                                        "#listContent"
                                        ]],
                    ["jobs.zhaopin.com",[".details_container",".company_name a", ""]],
                    ["search.51job.com",[".el", ".t2 a",""]],
                    ["jobs.51job.com", [".e",".info a.name",""]]
                    //[".*.58.com", [".job_item", ".comp_name a.fl",""]]
                ];
    for(let item of pattern){
        if(host.search(new RegExp(item[0]))>=0){
            let handle = new BlockCompany(list);
            handle.setSelector(item[1][0], item[1][1], item[1][2]);
            handle.main();
        }
    }
});