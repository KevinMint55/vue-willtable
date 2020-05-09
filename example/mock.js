import Mock from 'mockjs';

Mock.mock('https://demo.kevinmint.com/1.json', 'get', {
  // 属性 list 的值是一个数组，其中含有 1 到 3 个元素
  'list|100': [{
    // 属性 sid 是一个自增数，起始值为 1，每次增 1
    'sid|+1': 1,
    // 属性 userId 是一个5位的随机码
    'userId|5': '',
    // 属性 sex 是一个bool值
    'sex|1-2': true,
    // 属性 guid 是唯一机器码
    guid: '@guid',
    // 属性 id 是随机id
    id: '@id',
    // 属性 title 是一个随机长度的标题
    title: '@title()',
    // 属性 paragraph 是一个随机长度的段落
    paragraph: '@cparagraph',
    // 属性 image 是一个随机图片 参数分别为size, background, text
    image: "@image('200x100', '#4A7BF7', 'Hello')",
    // 属性 address 是一个随机地址
    address: '@county(true)',
    // 属性 date 是一个yyyy-MM-dd 的随机日期
    date: '@date("yyyy-MM-dd")',
    // 属性 date 是一个yyyy-MM-dd 的随机日期
    month: '',
    // 属性 time 是一个 size, background, text 的随机时间
    time: '@time("HH:mm:ss")',
    // 属性 url 是一个随机的url
    url: '@url',
    // 属性 email 是一个随机email
    email: '@email',
    // 属性 ip 是一个随机ip
    ip: '@ip',
    sum: '@ip',
    // 属性 regexp 是一个正则表达式匹配到的值 如aA1
    regexp: /[a-z][A-Z][0-9]/,
    name: '@name()',
    color: '@rgba()',
  }],
});

Mock.mock('http://2.json', 'get', {
  'list|20': [
    '@range(1, 100, 9)',
  ],
});

Mock.mock('http://3.json', 'get', {
  'list|120': [{
    // 属性 sid 是一个自增数，起始值为 1，每次增 1
    'sid|+1': 1,
    // 属性 userId 是一个5位的随机码
    'userId|5': '',
    // 属性 sex 是一个bool值
    'sex|1-2': true,
    // 属性 guid 是唯一机器码
    guid: '@guid',
    // 属性 id 是随机id
    id: '@id',
    // 属性 title 是一个随机长度的标题
    title: '@title()',
    // 属性 paragraph 是一个随机长度的段落
    paragraph: '@cparagraph',
    // 属性 image 是一个随机图片 参数分别为size, background, text
    image: "@image('200x100', '#4A7BF7', 'Hello')",
    // 属性 address 是一个随机地址
    address: '@county(true)',
    // 属性 date 是一个yyyy-MM-dd 的随机日期
    date: '@date("yyyy-MM-dd")',
    // 属性 date 是一个yyyy-MM-dd 的随机日期
    month: '',
    // 属性 time 是一个 size, background, text 的随机时间
    time: '@time("HH:mm:ss")',
    // 属性 url 是一个随机的url
    url: '@url',
    // 属性 email 是一个随机email
    email: '@email',
    // 属性 ip 是一个随机ip
    ip: '@ip',
    // 属性 regexp 是一个正则表达式匹配到的值 如aA1
    regexp: /[a-z][A-Z][0-9]/,
  }],
});

Mock.mock('http://4.json', 'get', {
  'list|200': [{
    // 属性 sid 是一个自增数，起始值为 1，每次增 1
    'sid|+1': 1,
    // 属性 userId 是一个5位的随机码
    'userId|5': '',
    // 属性 sex 是一个bool值
    'sex|1-2': true,
    // 属性 guid 是唯一机器码
    guid: '@guid',
    // 属性 id 是随机id
    id: '@id',
    // 属性 title 是一个随机长度的标题
    title: '@title()',
    // 属性 paragraph 是一个随机长度的段落
    paragraph: '@cparagraph',
    // 属性 image 是一个随机图片 参数分别为size, background, text
    image: "@image('200x100', '#4A7BF7', 'Hello')",
    // 属性 address 是一个随机地址
    address: '@county(true)',
    // 属性 date 是一个yyyy-MM-dd 的随机日期
    date: '@date("yyyy-MM-dd")',
    // 属性 date 是一个yyyy-MM-dd 的随机日期
    month: '',
    // 属性 time 是一个 size, background, text 的随机时间
    time: '@time("HH:mm:ss")',
    // 属性 url 是一个随机的url
    url: '@url',
    // 属性 email 是一个随机email
    email: '@email',
    // 属性 ip 是一个随机ip
    ip: '@ip',
    // 属性 regexp 是一个正则表达式匹配到的值 如aA1
    regexp: /[a-z][A-Z][0-9]/,
  }],
});
