import axios from "axios";
import qs from "qs";
import layx from "vue-layx";

// 设置默认值

axios.defaults.baseURL="http://localhost:8000/api"
axios.defaults.timeout=20000


// get请求方法, url请求的地址，去掉了baseURL以外的部分
function doGet(url, params) {
    return axios({
        url: url,
        method: 'get',
        params: params
    });
}

// 传递json数据，在请求的报文中是json数据格式
function doPostJson(url, params) {
    return axios({
        url:url,
        method:'post',
        data:params
    });
}

// 请求是key=value的形式
function doPost(url, params) {
    // qs 把json对象转为a=1&b=2, 也可以反向操作
    let requestData = qs.stringify(params);
    return axios.post(url, requestData);
}

// 创建拦截器
axios.interceptors.request.use(function (config) {
        // 在需要用户登录后的操作，再请求的url中加入token
        // 判断访问服务器url的地址，需要提供身份的才加入token
        console.log("url==" + config.url);
        let storageToken = window.localStorage.getItem("token");
        let userinfo = window.localStorage.getItem("userinfo");
        if (storageToken && userinfo) {
            if (config.url == '/v1/user/realname' || config.url == '/v1/user/usercenter'
                || config.url == '/v1/recharge/records' || config.url == '/v1/invest/product') {
                // 再header中传递token和userid
                config.headers['Authorization'] = 'Bearer' + storageToken;
                config.headers['uid'] = JSON.parse(userinfo).uid;
            }
        }
        return config;
    },
    function (err) {
        console.log("请求错误" + err);
    })


// 创建应答拦截器，同意对错误处理，后端返回code > 1000 都是错误
axios.interceptors.response.use(function (resp) {
    if (resp && resp.data.code > 1000) {
        let code = resp.data.code;
        if (code == 3000) {
            // token 无效
            window.location.href='/page/user/login';
        } else {
            layx.msg(resp.data.msg, {dialogIcon: 'warn', position:'ct'})
        }
    }
    return resp;
}, function (err) {
    console.log("应答拦截器错误： " + err);
    window.location.href="/";
})

// 导出，暴露这个函数，其他模块才能用
export {
    doGet,
    doPost,
    doPostJson
}