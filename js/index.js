const hostApi = 'https://hzpc.service.tcloudbase.com/api/v1.0'
//JS函数用于获取url参数:  getQueryVariable("id")
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) { return pair[1]; }
    }
    return (false);
}

//时间戳转换：formatTime(new Date(1606197807940))
const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':')
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

//获取分类列表，并渲染到页面
var blogs_cat = '';
axios.get(hostApi + '/blogs_cat')
    .then(res => {
        let data = res.data.data
        data.forEach(element => {
            blogs_cat += '<li class="cat-item"><a href="javascript:;">' + element.name + '</a> </li>'
        });
        $("#blogs_cat").append(blogs_cat);
    })
    .catch(function (error) {
        console.log(error);
    });



//获取最近文章列表，并渲染到页面
var blogs = '';
axios.get(hostApi + '/blogs', {
    params: {
        sort: { "_createTime": -1 }
    }
}).then(res => {
    let data = res.data.data
    data.forEach(item => {
        blogs += '<li><a href=/archives.html?id=' + item._id + '>' + item.title + '</a></li>'
    });
    $("#blogs").append(blogs);
}).catch(function (error) {
    console.log(error);
});



//文章详情页，获取数据，并渲染
function getList() {
    var md = window.markdownit();
    var id = getQueryVariable("id")

    axios.get(hostApi + '/blogs/' + id)
        .then(res => {
            let articles = res.data.data
            var result = md.render(articles.desc);
            $("#articles").html(result);
            $("#title").text(articles.title);
            $("#datetime").text(formatTime(new Date(articles._createTime)));
        })
        .catch(function (error) {
            console.log(error);
        });
}

//首页文章遍历
var html = '';
function articles(item) {
    let url = '/archives.html?id=' + item._id;
    let tagLinks = '';
    if (item.tag) {
        let tag = '';
        for (var i = 0; i < item.tag.length; i++) {
            tag += item.tag[i] + " "
        }
        tagLinks = '<li class="tag-links"> <i class="fa fa-tags"></i> ' + tag + ' </li>'
    }
    html += '<article class="post-content post-6 post type-post status-publish format-standard hentry category-default h-entry h-as-article"> <header class="entry-header"> <h2 class="entry-title p-name"><a href="' + url + '" rel="bookmark" class="u-url url">' + item.title + '</a></h2> </header> <div class="entry-summary  p-summary"> <p>' + item.desc.substr(0, 50).replace(/#/g, "") + '&hellip; <a href="' + url + '" class="more-link read-more" rel="bookmark">继续阅读 <span class="screen-reader-text">React 基本用法</span><i class="fa fa-arrow-right"></i></a></p> </div> <div class="entry-meta"> <ul> <li class="posted-on"> <i class="fa fa-calendar"></i> <span>' + formatTime(new Date(item._createTime)) + '</span> </li> <li class="author"> <i class="fa fa-user"></i> <span>王秀龙</span> </li> <li class="cat-links"> <i class="fa fa-folder-open"></i> <span class="screen-reader-text">分类：</span>' + item.cat.name + ' </li> ' + tagLinks + ' <div class="clear"></div> </ul> </div> </article>'

}


var limit = 6;   //每页6条数据
function getLists(skip) {
    axios.get(hostApi + '/blogs', {
        params: {
            sort: { "_createTime": -1 },
            skip: skip,
            limit: 5
        }
    }).then(res => {
        skip += 5
        let data = res.data.data
        html = '';
        data.forEach(articles)
        $("article").remove(".post-content");
        $("#main").prepend(html);

    }).catch(function (error) {
        console.log(error);
    });
}

var skip = 0, total = 0, p = 1;
//获取分页信息
function getPage() {
    var page = '<nav class="navigation pagination" role="navigation" aria-label="分页"> <h2 class="screen-reader-text">分页</h2><div class="nav-links"><a class="prev page-numbers" href="javascript:;" onclick="getPages(-1)">上一页</a> '
    axios.get(hostApi + '/blogs')
        .then(function (res) {
            total = res.data.total % 6 ? parseInt(res.data.total / 6) + 1 : res.data.total / 6
            for (let index = 1; index <= total; index++) {
                page += '<a class="page-numbers" href="javascript:;" onclick=getPages(' + index + ')><span class="meta-nav screen-reader-text">页码： </span>' + index + '</a> '
            }
            page += ' <a class="next page-numbers" href="javascript:;" onclick="getPages(0)">下一页</a></div>'
            page += '</div></nav><div class="clear"></div>'
            $("#main").append(page);
        })
        .catch(function (error) {
            console.log(error);
        });
}

//分页查询数据
function getPages(e) {
    switch (e) {
        case -1:
            p--
            break;
        case 0:
            p++
            break;
        default:
            if (p == e) {
                return
            }
            p = e
    }

    if (p > 0 && p <= total) {
        getLists((p - 1) * 6)
    } else {
        p = 1
    }
}