let isRunning = false;
const xlsx = require('node-xlsx').default;
const fs = require('fs')
const readline = require('readline');

// 最低粉丝数量，用户要超过这个粉丝数量才能被筛选出来
let minFansNum = 0;

// 用户名文件路径，需要拷贝绝对路径
const filePath = "F:\\WorkSpace\\ins-userinfo-crawler\\userinfo.txt";

let usernameList = [];
let curUser = '';
let apiPrefix = 'https://i.instagram.com/api/v1/users/web_profile_info/?username=';

const finalData = [];
const titleVec = ['username', 'fansNum', 'linkUrl', 'introduction'];
finalData.push(titleVec);

/**
 * 改中间这段代码就行
 */
var axios = require('axios');

var config = {
    method: 'get',
    url: 'https://i.instagram.com/api/v1/users/web_profile_info/?username=our.reality_life',
    headers: {
        'authority': 'i.instagram.com',
        'accept': '*/*',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'cache-control': 'no-cache',
        'cookie': 'mid=YdkfTgALAAEkbmcPqBufmiKyV3D5; ig_did=734B6C43-E743-461E-AEEF-6A635AD5BAAB; ig_nrcb=1; dpr=1.25; datr=uDgKY0maEvUCH6O4VjE1-JLp; shbid="5886054546202051210541694013488:01f7982e82d8d3768f790c828c6d5d7399669fdd44e893bb61e9a9534d5ba183fe277c9a"; shbts="1662477488054546202051210541694013488:01f7806056cd415efd53d13d04be968f139ac30af65d8361a44d2811a4ee2f897b0adbfc"; csrftoken=AChKcT1cFCePhygWaZKlIG10FOfRFd8A; ds_user_id=50932469833; sessionid=50932469833%3AQWOHIbc9E2oCz5%3A6%3AAYdxKCP6Ku6gRsA63RAqgK2PPpy0kdtJ2NbETjl14w; rur="NAO054509324698330541694444922:01f7021074258f830ec115c8b782c33bec0856373e23e9464a1f44e425e34f27027473a2"; csrftoken=o7GqP0J0iBhkPUuAE0twu3ir6c9W4zDc; ds_user_id=50932469833; rur="NAO\\05450932469833\\0541694441827:01f7faeb623250603969caaba3b1ad0d83e3012ef416b3c7ffbe7dc3c3f317b309546071"',
        'origin': 'https://www.instagram.com',
        'pragma': 'no-cache',
        'referer': 'https://www.instagram.com',
        'sec-ch-ua': '"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
        'x-asbd-id': '198387',
        'x-csrftoken': 'AChKcT1cFCePhygWaZKlIG10FOfRFd8A',
        'x-ig-app-id': '936619743392459',
        'x-ig-www-claim': 'hmac.AR3KuRFDSCk0skFGl4SXWU6veZyOi91rD2zuza36j38dYtxH',
        'x-instagram-ajax': '1006180197'
    }
};

axios(config)
    .then(function (response) {
        console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
        console.log(error);
    });

/**
 * 代码结束
 */

function run() {
    isRunning = true;
    curUser = usernameList.pop();
    config.url = `${apiPrefix}${curUser}`;
    axios(config)
        .then(async function (response) {
            const user = response.data.data.user;
            if (user.edge_followed_by.count >= minFansNum) {
                const userRow = [];
                userRow.push(curUser);
                userRow.push(user.edge_followed_by.count);
                userRow.push(user.external_url);
                userRow.push(user.biography);
                finalData.push(userRow);
            }
            isRunning = false;
            console.log(`=============="${curUser}" is filter finished, fansNum: ${user.edge_followed_by.count}, current list remain: ${usernameList.length}=====================`)

        })
        .catch(async function (error) {
            console.log('error info: ' + error);
            await sleep(60000);
            isRunning = false;
            saveDataIntoExcel();
            exit(0);
        });

}

async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function processLineByLine() {
    const fileStream = fs.createReadStream(filePath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    for await (const line of rl) {
        usernameList.push(line);
    }
    console.log("get from file: " + filePath + ", username list length: " + usernameList.length);
}

function saveDataIntoExcel() {
    let buffer = xlsx.build([{name: 'sheet1', data: finalData}]);
    fs.writeFileSync(`filter_file_${Date.now()}.xlsx`, buffer, {'flag': 'w'}); // 如果文件存在，覆盖
}


async function main() {
    await processLineByLine();
    while (usernameList.length !== 0) {
        if (isRunning) {
            await sleep(500);
            continue;
        }
        run();
    }
    // 防止还有请求没结束
    await sleep(3000);
    saveDataIntoExcel();
    console.log('filter task finished')
}

main();



