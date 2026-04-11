// ═══════════════════════════════════════════════════════
// FOR STUDENTS — Plain-language self-help guide to using
// the CVC Exchange. English + draft Spanish translation.
// The Spanish is a first draft; a native speaker should
// review it before it goes out to students.
// ═══════════════════════════════════════════════════════

var STUDENT_LANG_KEY = 'appanalyst.student.lang.v1';

function studentsGetLang() {
  try { return localStorage.getItem(STUDENT_LANG_KEY) || 'en'; }
  catch (e) { return 'en'; }
}
function studentsSetLang(lang) {
  try { localStorage.setItem(STUDENT_LANG_KEY, lang); } catch (e) {}
  studentsRender();
}

var STUDENT_CONTENT_ZH = {
  stepsTitle: '\u4e94\u6b65\u6307\u5357',
  steps: [
    {
      n: 1,
      title: '\u786e\u8ba4\u4f60\u5df2\u5728\u4e3b\u5b66\u6821\u6ce8\u518c',
      body: '\u5728\u4f7f\u7528 CVC Exchange \u4e4b\u524d\uff0c\u4f60\u5fc5\u987b\u5728\u52a0\u5dde\u793e\u533a\u5b66\u9662\u62e5\u6709\u4e00\u4e2a\u6709\u6548\u7684\u5b66\u751f\u6863\u6848\u3002\u8fd9\u662f\u4f60\u7684<strong>\u4e3b\u5b66\u6821</strong> \u2014 \u4e5f\u5c31\u662f\u4f60\u7f34\u4ea4\u5b66\u8d39\u3001\u7533\u8bf7\u8d22\u52a1\u63f4\u52a9\u3001\u83b7\u5f97\u5b66\u4f4d\u7684\u5730\u65b9\u3002\u5982\u679c\u4f60\u8fd8\u6ca1\u6709\u7533\u8bf7\uff0c\u8bf7\u5148\u8bbf\u95ee <a href="https://www.cccapply.org" target="_blank" rel="noopener">cccapply.org</a>\u3002',
      check: '\u6211\u5728\u4e3b\u5b66\u6821\u6709\u6709\u6548\u7684\u5b66\u751f\u8bc1\u53f7'
    },
    {
      n: 2,
      title: '\u5728 cvc.edu \u641c\u7d22\u4f60\u9700\u8981\u7684\u8bfe\u7a0b',
      body: '\u8bbf\u95ee <a href="https://search.cvc.edu" target="_blank" rel="noopener">search.cvc.edu</a>\u3002\u8f93\u5165\u4f60\u9700\u8981\u7684\u8bfe\u7a0b\uff08\u4f8b\u5982 "Math 1A"\uff09\u6216\u6309\u5b66\u79d1\u6d4f\u89c8\u3002\u641c\u7d22\u7ed3\u679c\u4f1a\u5217\u51fa\u672c\u5b66\u671f\u6240\u6709\u63d0\u4f9b\u8be5\u8bfe\u7a0b\u7684\u52a0\u5dde\u793e\u533a\u5b66\u9662\uff0c\u5e76\u663e\u793a\u7a7a\u4f4d\u3002',
      check: '\u6211\u627e\u5230\u4e86\u60f3\u9009\u7684\u8bfe\u7a0b'
    },
    {
      n: 3,
      title: '\u70b9\u51fb "Enroll"\uff0c\u7136\u540e\u7528 OpenCCC \u8d26\u6237\u767b\u5f55',
      body: '\u627e\u5230\u5408\u9002\u7684\u7ae0\u8282\u540e\uff0c\u70b9\u51fb\u6ce8\u518c\u6309\u94ae\u3002\u7cfb\u7edf\u4f1a\u8981\u6c42\u4f60\u7528 <strong>OpenCCC \u8d26\u6237</strong> \u767b\u5f55 \u2014 \u5c31\u662f\u4f60\u5f53\u521d\u7528\u4e8e CCCApply \u7684\u90a3\u4e2a\u8d26\u6237\u3002\u5982\u679c\u7cfb\u7edf\u8981\u6c42\u9009\u62e9\u4e3b\u5b66\u6821\uff0c\u9009\u62e9\u4f60\u5df2\u6ce8\u518c\u7684\u90a3\u6240\u5b66\u6821\u3002',
      check: '\u6211\u5df2\u767b\u5f55\u5e76\u9009\u62e9\u4e86\u4e3b\u5b66\u6821'
    },
    {
      n: 4,
      title: '\u786e\u8ba4\u6ce8\u518c\u5e76\u7b49\u5f85\u540c\u6b65',
      body: '\u63d0\u4ea4\u540e\uff0c\u4ea4\u6d41\u5e73\u53f0\u4f1a\u5c06\u4f60\u7684\u6ce8\u518c\u4fe1\u606f\u540c\u65f6\u53d1\u9001\u5230\u4e3b\u5b66\u6821\u548c\u6388\u8bfe\u5b66\u6821\u3002\u8fd9\u4e2a\u8fc7\u7a0b\u53ef\u80fd\u9700\u8981\u51e0\u5206\u949f\u5230\u51e0\u5c0f\u65f6\u4e0d\u7b49\uff0c\u53d6\u51b3\u4e8e\u5404\u7cfb\u7edf\u7684\u60c5\u51b5\u3002\u4f60\u4f1a\u6536\u5230\u4e00\u5c01\u786e\u8ba4\u90ae\u4ef6\u3002',
      check: '\u6211\u6536\u5230\u4e86\u786e\u8ba4\u90ae\u4ef6'
    },
    {
      n: 5,
      title: '\u5728 Canvas \u4e2d\u8bbf\u95ee\u8bfe\u7a0b',
      body: '\u540c\u6b65\u5b8c\u6210\u540e\uff0c\u8bfe\u7a0b\u4f1a\u51fa\u73b0\u5728\u4f60\u7684 <strong>Canvas \u4eea\u8868\u76d8</strong> \u4e0a\u3002\u8bf7\u4f7f\u7528 OpenCCC \u51ed\u8bc1\u6216\u5b66\u6821\u7684 SSO \u767b\u5f55\u6559\u5b66\u5b66\u6821\u7684 Canvas \u7ad9\u70b9\uff08\u4f8b\u5982 <code>canvas.foothill.edu</code>\uff09\u3002\u8bfe\u7a0b\u4f1a\u5728\u4f60\u7684\u5217\u8868\u4e2d\u663e\u793a\u3002',
      check: '\u8bfe\u7a0b\u5df2\u5728\u6211\u7684 Canvas \u4e2d'
    }
  ],
  troublesTitle: '\u5e38\u89c1\u95ee\u9898\u89e3\u51b3',
  troubles: [
    {
      symptom: '\u6211\u7684\u8bfe\u7a0b\u6ca1\u6709\u5728 Canvas \u4e2d\u663e\u793a',
      causes: '\u6ce8\u518c\u4fe1\u606f\u5c1a\u672a\u540c\u6b65\u5b8c\u6210\uff0c\u6216\u8005\u4e24\u4e2a\u5b66\u6821\u7684\u7cfb\u7edf\u4e4b\u95f4\u5b58\u5728\u5ef6\u8fdf\u3002',
      action: '\u8bf7\u7b49\u5f85 24 \u5c0f\u65f6\u3002\u5982\u679c\u4ecd\u672a\u51fa\u73b0\uff0c\u8bf7\u8054\u7cfb\u4f60<strong>\u4e3b\u5b66\u6821</strong>\uff08\u4e0d\u662f\u6559\u5b66\u5b66\u6821\uff09\u7684 Admissions & Records \u529e\u516c\u5ba4\uff0c\u8bf7\u4ed6\u4eec\u9a8c\u8bc1\u4f60\u7684 Exchange \u6ce8\u518c\u8bb0\u5f55\u3002'
    },
    {
      symptom: '\u6211\u8bd5\u56fe\u6ce8\u518c\u65f6\u51fa\u73b0\u9519\u8bef',
      causes: '\u5e38\u89c1\u9519\u8bef\uff1a\u4f60\u8fd8\u6ca1\u6709\u5b8c\u6210\u4e3b\u5b66\u6821\u7684\u65b0\u751f\u5165\u5b66\u57fa\u672c\u8bfe\uff08orientation\uff09\u3001\u6709\u6ce8\u518c\u51bb\u7ed3\u3001\u8bfe\u7a0b\u9700\u8981\u5148\u4fee\u8bfe\u7a0b\uff0c\u6216\u8005\u8be5\u7ae0\u8282\u5df2\u6ee1\u3002',
      action: '\u68c0\u67e5\u4f60\u4e3b\u5b66\u6821\u7684\u5b66\u751f\u95e8\u6237\u662f\u5426\u6709\u4efb\u4f55\u51bb\u7ed3\u3002\u5982\u679c\u6ca1\u6709\uff0c\u8bf7\u5c06\u9519\u8bef\u622a\u56fe\u53d1\u9001\u7ed9\u4e3b\u5b66\u6821\u7684 Counseling \u529e\u516c\u5ba4\u3002'
    },
    {
      symptom: '\u6211\u7684\u8d22\u52a1\u63f4\u52a9\u6ca1\u6709\u652f\u4ed8 Exchange \u8bfe\u7a0b',
      causes: '\u4f60\u7684\u4e3b\u5b66\u6821\u9700\u8981\u8bbe\u7f6e\u4e00\u4efd<strong>\u8054\u7cfb\u534f\u8bae\uff08Consortium Agreement\uff09</strong>\uff0c\u624d\u80fd\u5c06\u8d22\u52a1\u63f4\u52a9\u7528\u4e8e\u5176\u4ed6\u5b66\u6821\u7684\u8bfe\u7a0b\u3002',
      action: '\u8054\u7cfb\u4e3b\u5b66\u6821\u7684 Financial Aid \u529e\u516c\u5ba4\uff0c\u8be2\u95ee\u5173\u4e8e\u4f60\u7684 CVC Exchange \u8bfe\u7a0b\u7684\u8054\u7cfb\u534f\u8bae\u3002\u6b64\u534f\u8bae\u5fc5\u987b\u5728\u6dfb\u52a0/\u9000\u8bfe\u622a\u6b62\u65e5\u671f\u524d\u5b8c\u6210\u3002'
    },
    {
      symptom: '\u6211\u9700\u8981\u5728\u6559\u5b66\u5b66\u6821\u7533\u8bf7\u7279\u6b8a\u8bf7\u6c42\uff08DSPS\uff09',
      causes: '\u7279\u6b8a\u8bf7\u6c42\u4e0d\u4f1a\u81ea\u52a8\u5728\u4e24\u4e2a\u5b66\u6821\u4e4b\u95f4\u8f6c\u79fb\u3002\u4f60\u5fc5\u987b\u5728\u6559\u5b66\u5b66\u6821\u5411 DSPS \u6ce8\u518c\u3002',
      action: '\u4e00\u65e6\u6ce8\u518c\uff0c\u7acb\u5373\u8054\u7cfb\u6559\u5b66\u5b66\u6821\u7684 DSPS \u529e\u516c\u5ba4\u3002\u544a\u8bc9\u4ed6\u4eec\u4f60\u662f\u6765\u81ea [\u4e3b\u5b66\u6821] \u7684 CVC Exchange \u5b66\u751f\uff0c\u5e76\u8be2\u95ee\u5982\u4f55\u5206\u4eab\u4f60\u7684\u7279\u6b8a\u8bf7\u6c42\u4fe1\u4ef6\u3002'
    },
    {
      symptom: '\u6211\u60f3\u9000 Exchange \u8bfe\u7a0b',
      causes: '\u5fc5\u987b\u901a\u8fc7 Exchange \u9000\u8bfe\uff0c\u800c\u4e0d\u662f\u901a\u8fc7\u6559\u5b66\u5b66\u6821\u7684\u6b63\u5e38\u9000\u8bfe\u6d41\u7a0b\u3002',
      action: '\u56de\u5230 <a href="https://cvc.edu" target="_blank" rel="noopener">cvc.edu</a>\uff0c\u767b\u5f55\uff0c\u5728\u4eea\u8868\u76d8\u4e2d\u627e\u5230\u8bfe\u7a0b\uff0c\u4f7f\u7528\u90a3\u91cc\u7684\u9000\u8bfe\u9009\u9879\u3002\u8bf7\u6ce8\u610f\u9000\u8bfe\u622a\u6b62\u65e5\u671f \u2014 \u5b83\u4eec\u9075\u5faa\u6559\u5b66\u5b66\u6821\u7684\u65e5\u5386\u3002'
    },
    {
      symptom: '\u6211\u65e0\u6cd5\u7528 OpenCCC \u8d26\u6237\u767b\u5f55',
      causes: 'OpenCCC \u5bc6\u7801\u53ef\u80fd\u9700\u8981\u91cd\u7f6e\uff0c\u6216\u8005\u4e3b\u5b66\u6821\u7684\u767b\u5f55\u96c6\u6210\u53ef\u80fd\u6682\u65f6\u4e2d\u65ad\u3002',
      action: '\u9996\u5148\u5728 <a href="https://www.opencccapply.net" target="_blank" rel="noopener">OpenCCC</a> \u4e0a\u5c1d\u8bd5\u5bc6\u7801\u6062\u590d\u3002\u5982\u679c\u4e0d\u884c\uff0c\u8054\u7cfb\u4e3b\u5b66\u6821\u7684 IT \u5e2e\u52a9\u53f0\u3002'
    }
  ],
  contactsTitle: '\u5404\u5b66\u6821\u8054\u7cfb\u4eba',
  contacts: [
    { role: 'Admissions & Records', body: '\u8d1f\u8d23\u6ce8\u518c\u8bb0\u5f55\u3001\u6210\u7ee9\u5355\u3001\u6ce8\u518c\u51bb\u7ed3\u548c\u9000\u8bfe\u95ee\u9898\u3002<strong>\u8bf7\u5148\u8054\u7cfb\u4f60\u7684\u4e3b\u5b66\u6821</strong>\u5904\u7406\u4efb\u4f55\u6ce8\u518c\u6216\u6210\u7ee9\u5355\u95ee\u9898\u3002' },
    { role: 'Financial Aid', body: '\u8d1f\u8d23 FAFSA\u3001CCPG\uff08\u5b66\u8d39\u51cf\u514d\uff09\u3001\u8054\u7cfb\u534f\u8bae\u548c\u6d3e\u53d1\u3002<strong>\u53ea\u6709\u4f60\u7684\u4e3b\u5b66\u6821</strong>\u5904\u7406\u4f60\u7684\u63f4\u52a9\u3002' },
    { role: 'Counseling', body: '\u8d1f\u8d23\u8bfe\u7a0b\u89c4\u5212\u3001\u8f6c\u5b66\u95ee\u9898\u548c Exchange \u5bfc\u822a\u5e2e\u52a9\u3002\u4e0e\u4f60\u7684\u4e3b\u5b66\u6821\u5bc6\u5207\u5408\u4f5c\u3002' },
    { role: 'DSPS', body: '\u8d1f\u8d23\u7279\u6b8a\u8bf7\u6c42\u3001\u66ff\u4ee3\u683c\u5f0f\u548c\u65e0\u969c\u788d\u652f\u6301\u3002<strong>\u4e24\u4e2a</strong>\u4e3b\u5b66\u6821\u548c\u6559\u5b66\u5b66\u6821\u7684 DSPS \u529e\u516c\u5ba4\u90fd\u9700\u8981\u8054\u7cfb\u3002' },
    { role: 'Instructor', body: '\u8d1f\u8d23\u8bfe\u7a0b\u5185\u5bb9\u3001\u4f5c\u4e1a\u548c Canvas \u76f8\u5173\u95ee\u9898\u3002<strong>\u5411\u6559\u5b66\u5b66\u6821\u7684\u6559\u5e08\u8054\u7cfb</strong>\u8be2\u95ee\u8bfe\u7a0b\u5177\u4f53\u95ee\u9898\u3002' }
  ]
};

var STUDENT_CONTENT_VI = {
  stepsTitle: 'H\u01b0\u1edbng d\u1eabn 5 b\u01b0\u1edbc',
  steps: [
    {
      n: 1,
      title: '\u0110\u1ea3m b\u1ea3o b\u1ea1n \u0111\u00e3 ghi danh t\u1ea1i tr\u01b0\u1eddng ch\u00ednh',
      body: 'B\u1ea1n c\u1ea7n c\u00f3 h\u1ed3 s\u01a1 sinh vi\u00ean \u0111ang ho\u1ea1t \u0111\u1ed9ng t\u1ea1i m\u1ed9t tr\u01b0\u1eddng cao \u0111\u1eb3ng c\u1ed9ng \u0111\u1ed3ng California tr\u01b0\u1edbc khi c\u00f3 th\u1ec3 s\u1eed d\u1ee5ng CVC Exchange. \u0110\u00e2y l\u00e0 <strong>tr\u01b0\u1eddng ch\u00ednh</strong> c\u1ee7a b\u1ea1n \u2014 n\u01a1i b\u1ea1n n\u1ed9p h\u1ecdc ph\u00ed, xin h\u1ed7 tr\u1ee3 t\u00e0i ch\u00ednh, v\u00e0 nh\u1eadn b\u1eb1ng c\u1ea5p. N\u1ebfu b\u1ea1n ch\u01b0a n\u1ed9p \u0111\u01a1n, b\u1eaft \u0111\u1ea7u t\u1ea1i <a href="https://www.cccapply.org" target="_blank" rel="noopener">cccapply.org</a>.',
      check: 'T\u00f4i c\u00f3 m\u00e3 s\u1ed1 sinh vi\u00ean \u0111ang ho\u1ea1t \u0111\u1ed9ng t\u1ea1i tr\u01b0\u1eddng ch\u00ednh'
    },
    {
      n: 2,
      title: 'T\u00ecm kh\u00f3a h\u1ecdc c\u1ee7a b\u1ea1n t\u1ea1i cvc.edu',
      body: 'Truy c\u1eadp <a href="https://search.cvc.edu" target="_blank" rel="noopener">search.cvc.edu</a>. Nh\u1eadp kh\u00f3a h\u1ecdc b\u1ea1n c\u1ea7n (v\u00ed d\u1ee5 "Math 1A") ho\u1eb7c duy\u1ec7t theo m\u00f4n h\u1ecdc. K\u1ebft qu\u1ea3 hi\u1ec3n th\u1ecb m\u1ecdi tr\u01b0\u1eddng cao \u0111\u1eb3ng c\u1ed9ng \u0111\u1ed3ng California cung c\u1ea5p kh\u00f3a h\u1ecdc \u0111\u00f3 tr\u1ef1c tuy\u1ebfn trong h\u1ecdc k\u1ef3 n\u00e0y, v\u1edbi s\u1ed1 ch\u1ed7 tr\u1ed1ng.',
      check: 'T\u00f4i \u0111\u00e3 t\u00ecm th\u1ea5y m\u1ed9t s\u1ed1 l\u1edbp t\u00f4i mu\u1ed1n'
    },
    {
      n: 3,
      title: 'Nh\u1ea5p "Enroll" v\u00e0 \u0111\u0103ng nh\u1eadp b\u1eb1ng t\u00e0i kho\u1ea3n OpenCCC c\u1ee7a b\u1ea1n',
      body: 'Khi b\u1ea1n t\u00ecm th\u1ea5y m\u1ed9t s\u1ed1 l\u1edbp, nh\u1ea5p n\u00fat Enroll. B\u1ea1n s\u1ebd \u0111\u0103ng nh\u1eadp b\u1eb1ng <strong>t\u00e0i kho\u1ea3n OpenCCC</strong> \u2014 ch\u00ednh l\u00e0 t\u00e0i kho\u1ea3n b\u1ea1n \u0111\u00e3 s\u1eed d\u1ee5ng cho CCCApply. N\u1ebfu h\u1ec7 th\u1ed1ng y\u00eau c\u1ea7u ch\u1ecdn tr\u01b0\u1eddng ch\u00ednh, ch\u1ecdn tr\u01b0\u1eddng m\u00e0 b\u1ea1n \u0111\u00e3 ghi danh.',
      check: 'T\u00f4i \u0111\u00e3 \u0111\u0103ng nh\u1eadp v\u00e0 ch\u1ecdn tr\u01b0\u1eddng ch\u00ednh'
    },
    {
      n: 4,
      title: 'X\u00e1c nh\u1eadn ghi danh v\u00e0 ch\u1edd \u0111\u1ed3ng b\u1ed9',
      body: 'Sau khi b\u1ea1n g\u1eedi, Exchange s\u1ebd g\u1eedi th\u00f4ng tin ghi danh c\u1ee7a b\u1ea1n \u0111\u1ebfn c\u1ea3 tr\u01b0\u1eddng ch\u00ednh v\u00e0 tr\u01b0\u1eddng d\u1ea1y. Qu\u00e1 tr\u00ecnh n\u00e0y c\u00f3 th\u1ec3 m\u1ea5t t\u1eeb v\u00e0i ph\u00fat \u0111\u1ebfn v\u00e0i gi\u1edd t\u00f9y thu\u1ed9c v\u00e0o c\u00e1c h\u1ec7 th\u1ed1ng. B\u1ea1n s\u1ebd nh\u1eadn \u0111\u01b0\u1ee3c email x\u00e1c nh\u1eadn.',
      check: 'T\u00f4i \u0111\u00e3 nh\u1eadn email x\u00e1c nh\u1eadn'
    },
    {
      n: 5,
      title: 'Truy c\u1eadp kh\u00f3a h\u1ecdc trong Canvas',
      body: 'Sau khi \u0111\u1ed3ng b\u1ed9 ho\u00e0n t\u1ea5t, kh\u00f3a h\u1ecdc s\u1ebd xu\u1ea5t hi\u1ec7n tr\u00ean <strong>b\u1ea3ng \u0111i\u1ec1u khi\u1ec3n Canvas</strong> c\u1ee7a b\u1ea1n. \u0110\u0103ng nh\u1eadp v\u00e0o trang Canvas c\u1ee7a tr\u01b0\u1eddng d\u1ea1y (v\u00ed d\u1ee5 <code>canvas.foothill.edu</code>) b\u1eb1ng th\u00f4ng tin OpenCCC ho\u1eb7c SSO c\u1ee7a tr\u01b0\u1eddng. Kh\u00f3a h\u1ecdc s\u1ebd xu\u1ea5t hi\u1ec7n trong danh s\u00e1ch c\u1ee7a b\u1ea1n.',
      check: 'Kh\u00f3a h\u1ecdc \u0111\u00e3 c\u00f3 trong Canvas c\u1ee7a t\u00f4i'
    }
  ],
  troublesTitle: 'X\u1eed l\u00fd s\u1ef1 c\u1ed1 \u2014 c\u00e1c v\u1ea5n \u0111\u1ec1 th\u01b0\u1eddng g\u1eb7p',
  troubles: [
    {
      symptom: 'Kh\u00f3a h\u1ecdc c\u1ee7a t\u00f4i kh\u00f4ng hi\u1ec7n trong Canvas',
      causes: 'Th\u00f4ng tin ghi danh ch\u01b0a \u0111\u1ed3ng b\u1ed9 xong, ho\u1eb7c c\u00f3 \u0111\u1ed9 tr\u1ec5 gi\u1eefa c\u00e1c tr\u01b0\u1eddng.',
      action: 'Ch\u1edd 24 gi\u1edd. N\u1ebfu v\u1eabn kh\u00f4ng th\u1ea5y, li\u00ean h\u1ec7 v\u0103n ph\u00f2ng <strong>Admissions & Records</strong> c\u1ee7a tr\u01b0\u1eddng ch\u00ednh (kh\u00f4ng ph\u1ea3i tr\u01b0\u1eddng d\u1ea1y) v\u00e0 y\u00eau c\u1ea7u h\u1ecd x\u00e1c minh h\u1ed3 s\u01a1 ghi danh Exchange c\u1ee7a b\u1ea1n.'
    },
    {
      symptom: 'T\u00f4i g\u1eb7p l\u1ed7i khi c\u1ed1 g\u1eafng ghi danh',
      causes: 'Nh\u1eefng l\u1ed7i ph\u1ed5 bi\u1ebfn: b\u1ea1n ch\u01b0a ho\u00e0n th\u00e0nh orientation \u1edf tr\u01b0\u1eddng ch\u00ednh, b\u1ea1n c\u00f3 hold \u0111\u0103ng k\u00fd, kh\u00f3a h\u1ecdc y\u00eau c\u1ea7u m\u00f4n ti\u00ean quy\u1ebft, ho\u1eb7c l\u1edbp \u0111\u1ea7y.',
      action: 'Ki\u1ec3m tra c\u1ed5ng sinh vi\u00ean c\u1ee7a tr\u01b0\u1eddng ch\u00ednh xem c\u00f3 b\u1ea5t k\u1ef3 hold n\u00e0o kh\u00f4ng. N\u1ebfu kh\u00f4ng, g\u1eedi email cho v\u0103n ph\u00f2ng Counseling c\u1ee7a tr\u01b0\u1eddng ch\u00ednh k\u00e8m \u1ea3nh ch\u1ee5p l\u1ed7i.'
    },
    {
      symptom: 'Tr\u1ee3 c\u1ea5p t\u00e0i ch\u00ednh c\u1ee7a t\u00f4i kh\u00f4ng \u00e1p d\u1ee5ng cho kh\u00f3a h\u1ecdc CVC',
      causes: 'Tr\u01b0\u1eddng ch\u00ednh c\u1ea7n thi\u1ebft l\u1eadp <strong>Th\u1ecfa thu\u1eadn Consortium</strong> \u0111\u1ec3 tr\u1ee3 c\u1ea5p c\u1ee7a b\u1ea1n \u00e1p d\u1ee5ng cho c\u00e1c kh\u00f3a h\u1ecdc \u0111\u01b0\u1ee3c h\u1ecdc t\u1ea1i tr\u01b0\u1eddng kh\u00e1c qua Exchange.',
      action: 'Li\u00ean h\u1ec7 v\u0103n ph\u00f2ng Financial Aid t\u1ea1i tr\u01b0\u1eddng ch\u00ednh v\u00e0 h\u1ecfi v\u1ec1 Th\u1ecfa thu\u1eadn Consortium cho kh\u00f3a h\u1ecdc CVC Exchange c\u1ee7a b\u1ea1n. Vi\u1ec7c n\u00e0y ph\u1ea3i \u0111\u01b0\u1ee3c thi\u1ebft l\u1eadp tr\u01b0\u1edbc h\u1ea1n ch\u00f3t add.'
    },
    {
      symptom: 'T\u00f4i c\u1ea7n \u0111i\u1ec1u ti\u1ebft (DSPS) t\u1ea1i tr\u01b0\u1eddng d\u1ea1y',
      causes: '\u0110i\u1ec1u ti\u1ebft kh\u00f4ng t\u1ef1 \u0111\u1ed9ng chuy\u1ec3n gi\u1eefa c\u00e1c tr\u01b0\u1eddng. B\u1ea1n ph\u1ea3i \u0111\u0103ng k\u00fd v\u1edbi DSPS t\u1ea1i tr\u01b0\u1eddng d\u1ea1y.',
      action: 'G\u1eedi email ho\u1eb7c g\u1ecdi cho v\u0103n ph\u00f2ng DSPS c\u1ee7a tr\u01b0\u1eddng d\u1ea1y ngay sau khi ghi danh. Cho h\u1ecd bi\u1ebft b\u1ea1n l\u00e0 sinh vi\u00ean CVC Exchange t\u1eeb [tr\u01b0\u1eddng ch\u00ednh c\u1ee7a b\u1ea1n] v\u00e0 h\u1ecfi c\u00e1ch chia s\u1ebb th\u01b0 \u0111i\u1ec1u ti\u1ebft.'
    },
    {
      symptom: 'T\u00f4i mu\u1ed1n b\u1ecf kh\u00f3a h\u1ecdc Exchange',
      causes: 'Vi\u1ec7c b\u1ecf l\u1edbp ph\u1ea3i \u0111\u01b0\u1ee3c th\u1ef1c hi\u1ec7n qua Exchange, kh\u00f4ng qua quy tr\u00ecnh b\u1ecf l\u1edbp th\u00f4ng th\u01b0\u1eddng c\u1ee7a tr\u01b0\u1eddng d\u1ea1y.',
      action: 'Quay l\u1ea1i <a href="https://cvc.edu" target="_blank" rel="noopener">cvc.edu</a>, \u0111\u0103ng nh\u1eadp, t\u00ecm kh\u00f3a h\u1ecdc trong b\u1ea3ng \u0111i\u1ec1u khi\u1ec3n, v\u00e0 s\u1eed d\u1ee5ng t\u00f9y ch\u1ecdn drop \u1edf \u0111\u00f3. L\u01b0u \u00fd \u0111\u1ebfn c\u00e1c h\u1ea1n ch\u00f3t \u2014 ch\u00fang theo l\u1ecbch c\u1ee7a tr\u01b0\u1eddng d\u1ea1y.'
    },
    {
      symptom: 'T\u00f4i kh\u00f4ng th\u1ec3 \u0111\u0103ng nh\u1eadp b\u1eb1ng t\u00e0i kho\u1ea3n OpenCCC',
      causes: 'M\u1eadt kh\u1ea9u OpenCCC c\u1ee7a b\u1ea1n c\u00f3 th\u1ec3 c\u1ea7n \u0111\u1eb7t l\u1ea1i, ho\u1eb7c t\u00edch h\u1ee3p \u0111\u0103ng nh\u1eadp c\u1ee7a tr\u01b0\u1eddng ch\u00ednh c\u00f3 th\u1ec3 t\u1ea1m th\u1eddi g\u1eb7p s\u1ef1 c\u1ed1.',
      action: 'Tr\u01b0\u1edbc ti\u00ean th\u1eed kh\u00f4i ph\u1ee5c m\u1eadt kh\u1ea9u tr\u00ean <a href="https://www.opencccapply.net" target="_blank" rel="noopener">OpenCCC</a>. N\u1ebfu kh\u00f4ng \u0111\u01b0\u1ee3c, li\u00ean h\u1ec7 b\u00e0n tr\u1ee3 gi\u00fap IT c\u1ee7a tr\u01b0\u1eddng ch\u00ednh.'
    }
  ],
  contactsTitle: 'Li\u00ean h\u1ec7 ai t\u1ea1i m\u1ed7i tr\u01b0\u1eddng',
  contacts: [
    { role: 'Admissions & Records', body: 'Cho h\u1ed3 s\u01a1 ghi danh, b\u1ea3ng \u0111i\u1ec3m, hold \u0111\u0103ng k\u00fd v\u00e0 c\u00e2u h\u1ecfi v\u1ec1 drop. <strong>B\u1eaft \u0111\u1ea7u v\u1edbi tr\u01b0\u1eddng ch\u00ednh c\u1ee7a b\u1ea1n</strong> cho m\u1ecdi v\u1ea5n \u0111\u1ec1 ghi danh.' },
    { role: 'Financial Aid', body: 'Cho FAFSA, CCPG (mi\u1ec5n h\u1ecdc ph\u00ed), Th\u1ecfa thu\u1eadn Consortium v\u00e0 gi\u1ea3i ng\u00e2n. <strong>Ch\u1ec9 tr\u01b0\u1eddng ch\u00ednh c\u1ee7a b\u1ea1n</strong> x\u1eed l\u00fd tr\u1ee3 c\u1ea5p.' },
    { role: 'Counseling', body: 'Cho l\u1eadp k\u1ebf ho\u1ea1ch kh\u00f3a h\u1ecdc, c\u00e2u h\u1ecfi chuy\u1ec3n tr\u01b0\u1eddng v\u00e0 h\u01b0\u1edbng d\u1eabn s\u1eed d\u1ee5ng Exchange. L\u00e0m vi\u1ec7c ch\u1eb7t ch\u1ebd v\u1edbi tr\u01b0\u1eddng ch\u00ednh c\u1ee7a b\u1ea1n.' },
    { role: 'DSPS', body: 'Cho \u0111i\u1ec1u ti\u1ebft, \u0111\u1ecbnh d\u1ea1ng thay th\u1ebf v\u00e0 h\u1ed7 tr\u1ee3 ti\u1ebfp c\u1eadn. Li\u00ean h\u1ec7 <strong>c\u1ea3 hai</strong> v\u0103n ph\u00f2ng DSPS c\u1ee7a tr\u01b0\u1eddng ch\u00ednh v\u00e0 tr\u01b0\u1eddng d\u1ea1y.' },
    { role: 'Instructor', body: 'Cho c\u00e2u h\u1ecfi v\u1ec1 n\u1ed9i dung kh\u00f3a h\u1ecdc, b\u00e0i t\u1eadp v\u00e0 Canvas. <strong>Li\u00ean h\u1ec7 gi\u00e1o vi\u00ean t\u1ea1i tr\u01b0\u1eddng d\u1ea1y</strong> cho c\u00e1c c\u00e2u h\u1ecfi c\u1ee5 th\u1ec3 v\u1ec1 kh\u00f3a h\u1ecdc.' }
  ]
};

var STUDENT_CONTENT_ES = {
  stepsTitle: 'Gu\u00eda en 5 pasos',
  steps: [
    {
      n: 1,
      title: 'Aseg\u00farate de estar inscrito(a) en tu colegio principal',
      body: 'Necesitas un expediente estudiantil activo en un colegio comunitario de California antes de poder usar el CVC Exchange. Este es tu <strong>colegio principal</strong> &mdash; donde pagas matr\u00edcula, solicitas ayuda financiera, y recibes tu t\u00edtulo. Si a\u00fan no has solicitado admisi\u00f3n, empieza en <a href="https://www.cccapply.org" target="_blank" rel="noopener">cccapply.org</a>.',
      check: 'Tengo un n\u00famero de estudiante activo en mi colegio principal'
    },
    {
      n: 2,
      title: 'Busca tu clase en cvc.edu',
      body: 'Ve a <a href="https://search.cvc.edu" target="_blank" rel="noopener">search.cvc.edu</a>. Escribe la clase que necesitas (por ejemplo "Math 1A") o navega por materia. Los resultados te muestran cada colegio comunitario de California que ofrece esa clase en l\u00ednea este semestre, con los cupos disponibles.',
      check: 'Encontr\u00e9 una secci\u00f3n que quiero tomar en otro colegio'
    },
    {
      n: 3,
      title: 'Haz clic en "Inscribirse" e inicia sesi\u00f3n con tu cuenta OpenCCC',
      body: 'Cuando encuentres una secci\u00f3n, haz clic en el bot\u00f3n Inscribirse. Iniciar\u00e1s sesi\u00f3n con tu <strong>cuenta OpenCCC</strong> &mdash; la misma que usaste para CCCApply. Si te pide elegir tu colegio principal, selecciona el colegio donde ya est\u00e1s inscrito(a).',
      check: 'Inici\u00e9 sesi\u00f3n y seleccion\u00e9 mi colegio principal'
    },
    {
      n: 4,
      title: 'Confirma tu inscripci\u00f3n y espera la sincronizaci\u00f3n',
      body: 'Una vez que env\u00edes, el Exchange manda tu inscripci\u00f3n tanto a tu colegio principal como al colegio que ensea el curso. Esto puede tardar desde unos minutos hasta algunas horas, dependiendo de los sistemas involucrados. Recibir\u00e1s un correo de confirmaci\u00f3n.',
      check: 'Recib\u00ed un correo de confirmaci\u00f3n'
    },
    {
      n: 5,
      title: 'Accede al curso en Canvas',
      body: 'Despu\u00e9s de que se complete la sincronizaci\u00f3n, el curso aparece en tu <strong>panel de Canvas</strong>. Inicia sesi\u00f3n en el sitio de Canvas del colegio que ensea (por ejemplo, <code>canvas.foothill.edu</code>) con tus credenciales de OpenCCC o con el SSO de tu colegio, seg\u00fan el caso. El curso aparecer\u00e1 en tu lista.',
      check: 'El curso est\u00e1 en mi Canvas'
    }
  ],
  troublesTitle: 'Soluci\u00f3n de problemas \u2014 situaciones comunes',
  troubles: [
    {
      symptom: 'Mi clase no aparece en Canvas',
      causes: 'La informaci\u00f3n de la inscripci\u00f3n a\u00fan no ha terminado de sincronizarse, o hay un retraso entre los sistemas de los colegios.',
      action: 'Espera 24 horas. Si todav\u00eda no aparece, contacta la oficina de <strong>Admissions & Records</strong> en tu colegio principal (no el que ensea) y pide que verifiquen tu registro de inscripci\u00f3n en el Exchange.'
    },
    {
      symptom: 'Recib\u00ed un error cuando intent\u00e9 inscribirme',
      causes: 'Errores comunes: no has completado la orientaci\u00f3n en tu colegio principal, tienes un bloqueo de inscripci\u00f3n, la clase requiere un prerrequisito que no has cumplido, o la secci\u00f3n est\u00e1 llena.',
      action: 'Revisa el portal de tu colegio principal para ver si tienes alg\u00fan bloqueo. Si no hay nada, env\u00eda un correo a la oficina de Counseling de tu colegio principal con una captura de pantalla del error.'
    },
    {
      symptom: 'Mi ayuda financiera no cubre el curso del Exchange',
      causes: 'Tu colegio principal necesita configurar un <strong>Acuerdo de Consorcio (Consortium Agreement)</strong> para que tu ayuda se aplique a cursos tomados en otros colegios a trav\u00e9s del Exchange.',
      action: 'Contacta la oficina de Financial Aid en tu colegio principal y preg\u00fanta sobre un Acuerdo de Consorcio para tu curso del Exchange. Esto debe configurarse antes de la fecha l\u00edmite para agregar clases.'
    },
    {
      symptom: 'Necesito una acomodaci\u00f3n (DSPS) en el colegio que ensea',
      causes: 'Las acomodaciones no se transfieren autom\u00e1ticamente entre colegios. Tienes que registrarte con DSPS en el colegio que ensea.',
      action: 'Env\u00eda un correo o llama a la oficina DSPS del colegio que ensea tan pronto como te inscribas. Diles que eres estudiante del CVC Exchange de [tu colegio principal] y pregunta c\u00f3mo compartir tu carta de acomodaciones.'
    },
    {
      symptom: 'Quiero retirarme del curso del Exchange',
      causes: 'Retirarse debe hacerse a trav\u00e9s del Exchange, no del proceso normal del colegio que ensea.',
      action: 'Regresa a <a href="https://cvc.edu" target="_blank" rel="noopener">cvc.edu</a>, inicia sesi\u00f3n, encuentra el curso en tu panel, y usa la opci\u00f3n de retiro ah\u00ed. Presta atenci\u00f3n a las fechas l\u00edmite \u2014 siguen el calendario del colegio que ensea.'
    },
    {
      symptom: 'No puedo iniciar sesi\u00f3n con mi cuenta OpenCCC',
      causes: 'Tu contrase\u00f1a de OpenCCC podr\u00eda necesitar un reinicio, o la integraci\u00f3n de inicio de sesi\u00f3n de tu colegio principal podr\u00eda estar temporalmente ca\u00edda.',
      action: 'Primero intenta la <a href="https://www.opencccapply.net" target="_blank" rel="noopener">recuperaci\u00f3n de contrase\u00f1a</a> en OpenCCC. Si eso no funciona, contacta la mesa de ayuda de IT de tu colegio principal.'
    }
  ],
  contactsTitle: 'A qui\u00e9n contactar en cada colegio',
  contacts: [
    { role: 'Admissions & Records', body: 'Para registros de inscripci\u00f3n, transcripciones, bloqueos de registraci\u00f3n, y preguntas sobre cursos retirados. <strong>Empieza con tu colegio principal</strong> para cualquier asunto de inscripci\u00f3n o transcripci\u00f3n.' },
    { role: 'Financial Aid', body: 'Para FAFSA, CCPG (exenci\u00f3n de cuotas), Acuerdos de Consorcio, y desembolso. <strong>Solo tu colegio principal</strong> maneja tu ayuda financiera.' },
    { role: 'Counseling', body: 'Para planeaci\u00f3n de cursos, preguntas sobre transferencia, y ayuda navegando el Exchange. Trabaja estrechamente con tu colegio principal.' },
    { role: 'DSPS', body: 'Para acomodaciones, formatos alternativos, y apoyo de accesibilidad. Contacta <strong>ambos</strong> colegios principales y los que ensean.' },
    { role: 'Instructor', body: 'Para preguntas sobre contenido del curso, tareas, y Canvas. <strong>Contacta al instructor en el colegio que ensea</strong> para preguntas espec\u00edficas del curso.' }
  ]
};

var STUDENT_STEPS = [
  {
    n: 1,
    title: 'Make sure you\u2019re enrolled at your home college',
    body: 'You need an active student record at a California community college before you can use the CVC Exchange. This is your <strong>home college</strong> — where you pay fees, apply for financial aid, and receive your degree. If you haven\u2019t applied yet, start at <a href="https://www.cccapply.org" target="_blank" rel="noopener">cccapply.org</a>.',
    check: 'I have an active student ID at my home college'
  },
  {
    n: 2,
    title: 'Search for your course at cvc.edu',
    body: 'Go to <a href="https://search.cvc.edu" target="_blank" rel="noopener">search.cvc.edu</a>. Type the course you need (e.g., "Math 1A") or browse by subject. Results show you every California community college offering that course online this term, with open seats.',
    check: 'I found a section I want at another college'
  },
  {
    n: 3,
    title: 'Click "Enroll" and sign in with your OpenCCC account',
    body: 'When you find a section, click the Enroll button. You\u2019ll sign in with your <strong>OpenCCC account</strong> — the same one you used for CCCApply. If it asks you to pick your home college, select the one where you\u2019re already a student.',
    check: 'I signed in and selected my home college'
  },
  {
    n: 4,
    title: 'Confirm your enrollment and wait for sync',
    body: 'Once you submit, the Exchange sends your enrollment to both your home college and the teaching college. This can take anywhere from a few minutes to a few hours depending on the systems involved. You\u2019ll get a confirmation email.',
    check: 'I got a confirmation email'
  },
  {
    n: 5,
    title: 'Access the course in Canvas',
    body: 'After sync completes, the course shows up in your <strong>Canvas dashboard</strong>. Sign in at your teaching college\u2019s Canvas site (e.g., <code>canvas.foothill.edu</code>) with your OpenCCC credentials or your college SSO, depending on the college. The course will appear in your list.',
    check: 'The course is in my Canvas'
  }
];

var STUDENT_TROUBLES = [
  {
    symptom: 'My course isn\u2019t showing up in Canvas',
    causes: 'The enrollment data hasn\u2019t finished syncing, or there\u2019s a system delay between colleges.',
    action: 'Wait 24 hours. If it still isn\u2019t there, contact the <strong>Admissions & Records</strong> office at your home college (not the teaching college) and ask them to verify your Exchange enrollment record.'
  },
  {
    symptom: 'I got an error when I tried to enroll',
    causes: 'Common errors: you haven\u2019t completed orientation at your home college, you have a registration hold, the course requires a prerequisite you haven\u2019t met, or the section is full.',
    action: 'Check your home college\u2019s student portal for any holds or blocks. If nothing shows up there, email the Counseling office at your home college with a screenshot of the error.'
  },
  {
    symptom: 'My financial aid isn\u2019t covering the Exchange course',
    causes: 'Your home college needs to set up a <strong>Consortium Agreement</strong> so your aid applies to courses taken at other colleges through the Exchange.',
    action: 'Contact the Financial Aid office at your home college and ask about a Consortium Agreement for your CVC Exchange course. This has to be set up before the add/drop deadline.'
  },
  {
    symptom: 'I need an accommodation (DSPS) at the teaching college',
    causes: 'Accommodations don\u2019t automatically transfer between colleges. You have to register with DSPS at the teaching college.',
    action: 'Email or call the DSPS office at the teaching college as soon as you enroll. Let them know you\u2019re a CVC Exchange student from [your home college] and ask how to share your accommodation letter.'
  },
  {
    symptom: 'I want to drop the Exchange course',
    causes: 'Dropping has to happen through the Exchange, not through the teaching college\u2019s regular drop process.',
    action: 'Go back to <a href="https://cvc.edu" target="_blank" rel="noopener">cvc.edu</a>, sign in, find the course in your dashboard, and use the drop option there. Pay attention to drop deadlines — they follow the teaching college\u2019s calendar.'
  },
  {
    symptom: 'I can\u2019t sign in with my OpenCCC account',
    causes: 'Your OpenCCC password might need a reset, or your home college\u2019s sign-on integration might be temporarily down.',
    action: 'First try <a href="https://www.opencccapply.net" target="_blank" rel="noopener">password recovery</a> on OpenCCC. If that doesn\u2019t work, contact your home college\u2019s IT help desk.'
  }
];

function studentsEsc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function studentsRender() {
  var container = document.getElementById('forStudentsBody');
  if (!container) return;

  var lang = studentsGetLang();
  var contentMap = {
    es: STUDENT_CONTENT_ES,
    zh: STUDENT_CONTENT_ZH,
    vi: STUDENT_CONTENT_VI
  };
  var c = contentMap[lang] || null;
  var steps = c ? c.steps : STUDENT_STEPS;
  var troubles = c ? c.troubles : STUDENT_TROUBLES;
  var contacts = c ? c.contacts : null;
  var troublesTitle = c ? c.troublesTitle : 'Troubleshooting \u2014 common problems';
  var contactsTitle = c ? c.contactsTitle : 'Who to contact at each college';
  var causeLabel = lang === 'es' ? 'Causa probable' : lang === 'zh' ? '\u53ef\u80fd\u539f\u56e0' : lang === 'vi' ? 'Nguy\u00ean nh\u00e2n' : 'Likely cause';
  var actionLabel = lang === 'es' ? 'Qu\u00e9 hacer' : lang === 'zh' ? '\u600e\u4e48\u529e' : lang === 'vi' ? 'C\u1ea7n l\u00e0m g\u00ec' : 'What to do';

  var langs = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Espa\u00f1ol' },
    { code: 'zh', label: '\u4e2d\u6587' },
    { code: 'vi', label: 'Ti\u1ebfng Vi\u1ec7t' }
  ];
  var langToggle = '<div class="stu-lang-wrap">' +
    langs.map(function(l) {
      return '<button class="stu-lang-btn' + (l.code === lang ? ' stu-lang-active' : '') + '" onclick="studentsSetLang(\'' + l.code + '\')">' + l.label + '</button>';
    }).join('') +
    (lang !== 'en' ? '<span class="stu-lang-note">Draft translation &mdash; please flag any errors</span>' : '') +
  '</div>';

  var stepsHtml = '<div class="stu-steps">' +
    steps.map(function(s) {
      return '<div class="stu-step">' +
        '<div class="stu-step-num">' + s.n + '</div>' +
        '<div class="stu-step-main">' +
          '<div class="stu-step-title">' + s.title + '</div>' +
          '<div class="stu-step-body">' + s.body + '</div>' +
          '<div class="stu-step-check"><span class="stu-check-box">&#9634;</span> ' + s.check + '</div>' +
        '</div>' +
      '</div>';
    }).join('') +
  '</div>';

  var troublesHtml = '<div class="stu-troubles">' +
    '<h3 class="stu-troubles-title">' + troublesTitle + '</h3>' +
    troubles.map(function(t) {
      return '<div class="stu-trouble">' +
        '<div class="stu-trouble-symptom">' + t.symptom + '</div>' +
        '<div class="stu-trouble-row"><span class="stu-trouble-label">' + causeLabel + '</span><span>' + t.causes + '</span></div>' +
        '<div class="stu-trouble-row stu-trouble-action"><span class="stu-trouble-label">' + actionLabel + '</span><span>' + t.action + '</span></div>' +
      '</div>';
    }).join('') +
  '</div>';

  var contactsHtml;
  if (contacts) {
    contactsHtml =
      '<div class="stu-contacts">' +
        '<h3 class="stu-contacts-title">' + contactsTitle + '</h3>' +
        '<div class="stu-contact-grid">' +
          contacts.map(function(c) {
            return '<div class="stu-contact-card"><div class="stu-contact-role">' + c.role + '</div><div class="stu-contact-body">' + c.body + '</div></div>';
          }).join('') +
        '</div>' +
      '</div>';
  } else {
    contactsHtml =
      '<div class="stu-contacts">' +
        '<h3 class="stu-contacts-title">Who to contact at each college</h3>' +
        '<div class="stu-contact-grid">' +
          '<div class="stu-contact-card"><div class="stu-contact-role">Admissions & Records</div><div class="stu-contact-body">For enrollment records, transcripts, registration holds, and dropped-course questions. <strong>Start with your home college</strong> for any enrollment or transcript issue.</div></div>' +
          '<div class="stu-contact-card"><div class="stu-contact-role">Financial Aid</div><div class="stu-contact-body">For FAFSA, CCPG (fee waiver), Consortium Agreements, and disbursement. <strong>Only your home college</strong> handles your aid.</div></div>' +
          '<div class="stu-contact-card"><div class="stu-contact-role">Counseling</div><div class="stu-contact-body">For course planning, transfer questions, and help navigating the Exchange. Works closely with your home college.</div></div>' +
          '<div class="stu-contact-card"><div class="stu-contact-role">DSPS</div><div class="stu-contact-body">For accommodations, alternative formats, and accessibility support. Contact <strong>both</strong> home and teaching college DSPS offices.</div></div>' +
          '<div class="stu-contact-card"><div class="stu-contact-role">Instructor</div><div class="stu-contact-body">For questions about course content, assignments, and Canvas. <strong>Contact the instructor at the teaching college</strong> for course-specific questions.</div></div>' +
        '</div>' +
      '</div>';
  }

  container.innerHTML = langToggle + stepsHtml + troublesHtml + contactsHtml;
}

window.addEventListener('appanalyst:role-change', studentsRender);
studentsRender();
